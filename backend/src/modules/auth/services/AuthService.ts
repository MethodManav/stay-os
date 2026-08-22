import { IUserRepository } from '../../users/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../repositories/IRefreshTokenRepository';
import { IOrganizationRepository } from '../../organizations/repositories/IOrganizationRepository';
import { IBusinessRepository } from '../../businesses/repositories/IBusinessRepository';
import { IUserDocument } from '../../users/models/UserModel';
import { IOrganizationDocument } from '../../organizations/models/OrganizationModel';
import { IBusinessDocument } from '../../businesses/models/BusinessModel';
import { PasswordUtility } from '../../../shared/utils/PasswordUtility';
import { TokenUtility, TokenPayload } from '../../../shared/utils/TokenUtility';
import { ConflictError } from '../../../core/errors/ConflictError';
import { UnauthorizedError } from '../../../core/errors/UnauthorizedError';
import { NotFoundError } from '../../../core/errors/NotFoundError';
import mongoose, { ClientSession } from 'mongoose';
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: IUserDocument;
  tokens: AuthTokens;
}

export interface OnboardResponse extends AuthResponse {
  organization: IOrganizationDocument;
  business: IBusinessDocument;
}

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly businessRepository: IBusinessRepository
  ) {}

  public async registerAndOnboard(params: {
    userName: string;
    email: string;
    passwordHash: string; // Plaintext passed in, we hash it
    orgName: string;
    orgSlug: string;
    businessName: string;
    businessType: 'HOTEL' | 'RESORT' | 'HOMESTAY' | 'BOUTIQUE' | 'OTHER';
    businessPhone: string;
    businessAddress: string;
    businessCity: string;
    businessCountry: string;
    currency: string;
    timezone: string;
  }): Promise<OnboardResponse> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Check uniqueness
      const existingUser = await this.userRepository.findByEmail(params.email, session);
      if (existingUser) {
        throw new ConflictError('A user with this email address already exists');
      }

      const existingOrg = await this.organizationRepository.findBySlug(params.orgSlug, session);
      if (existingOrg) {
        throw new ConflictError('An organization with this slug already exists');
      }

    // 2. Hash Password
    const passwordHash = await PasswordUtility.hash(params.passwordHash);

    // 3. Create User (initially empty organizations, we'll push once org is created)
    const user = await this.userRepository.create({
      name: params.userName,
      email: params.email,
      passwordHash,
      organizations: [],
      status: 'ACTIVE'
    }, session);

    // 4. Create Organization
    const organization = await this.organizationRepository.create({
      name: params.orgName,
      slug: params.orgSlug,
      ownerId: user.id as any,
      status: 'ACTIVE'
    }, session);

    // 5. Add OWNER membership role to the user record
    const updatedUser = await this.userRepository.addOrganization(user.id, organization.id, 'OWNER', session);
    if (!updatedUser) {
      throw new Error('Failed to associate organization with user');
    }

    // 6. Create Business under organization
    const business = await this.businessRepository.create({
      organizationId: organization.id as any,
      name: params.businessName,
      slug: params.orgSlug, // Default business slug to org slug for simplicity
      type: params.businessType,
      email: params.email,
      phone: params.businessPhone,
      address: params.businessAddress,
      city: params.businessCity,
      country: params.businessCountry,
      currency: params.currency,
      timezone: params.timezone,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      breakfastPolicy: 'none',
      amenities: [],
      images: [],
      status: 'ACTIVE'
    }, session);

    // 7. Generate tokens
    const tokens = await this.generateTokensForUser(updatedUser, session);

    await session.commitTransaction();
    return {
      user: updatedUser,
      tokens,
      organization,
      business
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

  public async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await PasswordUtility.hash(password);
    const user = await this.userRepository.create({
      name,
      email,
      passwordHash,
      organizations: [],
      status: 'ACTIVE'
    });

    const tokens = await this.generateTokensForUser(user);
    return { user, tokens };
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await PasswordUtility.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.generateTokensForUser(user);
    return { user, tokens };
  }

  public async refresh(token: string): Promise<AuthTokens> {
    try {
      const decoded = TokenUtility.verifyRefreshToken(token);
      const tokenDoc = await this.refreshTokenRepository.findByToken(token);

      if (!tokenDoc || !tokenDoc.isActive() || tokenDoc.userId.toString() !== decoded.userId) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      const user = await this.userRepository.findById(decoded.userId);
      if (!user || user.status === 'SUSPENDED') {
        throw new UnauthorizedError('User account is inactive');
      }

      // Generate new tokens and rotate refresh token
      const newAccessToken = TokenUtility.generateAccessToken(this.buildTokenPayload(user));
      const newRefreshTokenString = TokenUtility.generateRefreshToken(user.id);
      
      // Expire in 7 days
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      await this.refreshTokenRepository.rotate(token, newRefreshTokenString, newExpiresAt);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenString
      };
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  public async logout(token: string): Promise<void> {
    await this.refreshTokenRepository.revoke(token);
  }

  public async changePassword(userId: string, oldPass: string, newPass: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isOldValid = await PasswordUtility.compare(oldPass, user.passwordHash);
    if (!isOldValid) {
      throw new UnauthorizedError('Incorrect old password');
    }

    const newHash = await PasswordUtility.hash(newPass);
    await this.userRepository.update(userId, { passwordHash: newHash });
    
    // Revoke all existing refresh tokens for security
    await this.refreshTokenRepository.revokeAllForUser(userId);
  }

  private async generateTokensForUser(user: IUserDocument, session?: ClientSession): Promise<AuthTokens> {
    const payload = this.buildTokenPayload(user);
    const accessToken = TokenUtility.generateAccessToken(payload);
    const refreshToken = TokenUtility.generateRefreshToken(user.id);

    // Set refresh token expiration (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.create(user.id, refreshToken, expiresAt, session);
    return { accessToken, refreshToken };
  }

  private buildTokenPayload(user: IUserDocument): TokenPayload {
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      organizations: user.organizations.map(org => ({
        organizationId: org.organizationId.toString(),
        role: org.role
      }))
    };
  }
}
export default AuthService;
