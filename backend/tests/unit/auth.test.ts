import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoUserRepository } from '../../src/modules/users/repositories/MongoUserRepository';
import { MongoRefreshTokenRepository } from '../../src/modules/auth/repositories/MongoRefreshTokenRepository';
import { MongoOrganizationRepository } from '../../src/modules/organizations/repositories/MongoOrganizationRepository';
import { MongoBusinessRepository } from '../../src/modules/businesses/repositories/MongoBusinessRepository';
import { AuthService } from '../../src/modules/auth/services/AuthService';
import { PasswordUtility } from '../../src/shared/utils/PasswordUtility';
import { TokenUtility } from '../../src/shared/utils/TokenUtility';
import { ConflictError } from '../../src/core/errors/ConflictError';
import { UnauthorizedError } from '../../src/core/errors/UnauthorizedError';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Setup in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear database before each test
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
});

describe('PasswordUtility Tests', () => {
  it('should successfully hash and verify a password', async () => {
    const password = 'mySecretPassword123';
    const hash = await PasswordUtility.hash(password);
    
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(20);
    
    const isValid = await PasswordUtility.compare(password, hash);
    expect(isValid).toBe(true);

    const isInvalid = await PasswordUtility.compare('wrongPassword', hash);
    expect(isInvalid).toBe(false);
  });
});

describe('AuthService Lifecycle Tests', () => {
  let authService: AuthService;
  let userRepo: MongoUserRepository;
  let tokenRepo: MongoRefreshTokenRepository;
  let orgRepo: MongoOrganizationRepository;
  let businessRepo: MongoBusinessRepository;

  beforeEach(() => {
    userRepo = new MongoUserRepository();
    tokenRepo = new MongoRefreshTokenRepository();
    orgRepo = new MongoOrganizationRepository();
    businessRepo = new MongoBusinessRepository();
    authService = new AuthService(userRepo, tokenRepo, orgRepo, businessRepo);
  });

  it('should register a new user successfully', async () => {
    const result = await authService.register('Manav', 'manav@stayos.com', 'securePass123');
    
    expect(result.user).toBeDefined();
    expect(result.user.name).toBe('Manav');
    expect(result.user.email).toBe('manav@stayos.com');
    expect(JSON.parse(JSON.stringify(result.user)).passwordHash).toBeUndefined(); // Verify password hash is hidden in JSON output
    
    expect(result.tokens).toBeDefined();
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();

    // Verify token validity
    const decoded = TokenUtility.verifyAccessToken(result.tokens.accessToken);
    expect(decoded.userId).toBe(result.user.id);
    expect(decoded.email).toBe('manav@stayos.com');
  });

  it('should throw ConflictError when registering with duplicate email', async () => {
    await authService.register('User One', 'dup@stayos.com', 'pass123');
    
    await expect(
      authService.register('User Two', 'dup@stayos.com', 'pass456')
    ).rejects.toThrow(ConflictError);
  });

  it('should authenticate user with valid credentials', async () => {
    await authService.register('Tester', 'tester@stayos.com', 'loginPassword');
    
    const result = await authService.login('tester@stayos.com', 'loginPassword');
    expect(result.user.name).toBe('Tester');
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
  });

  it('should throw UnauthorizedError with invalid password', async () => {
    await authService.register('Tester', 'tester@stayos.com', 'loginPassword');

    await expect(
      authService.login('tester@stayos.com', 'wrongPassword')
    ).rejects.toThrow(UnauthorizedError);
  });

  it('should rotate tokens on valid refresh request', async () => {
    const regResult = await authService.register('Rotator', 'rotate@stayos.com', 'rotatePass');
    const oldRefresh = regResult.tokens.refreshToken;

    // Wait a brief moment to simulate timing differences if necessary
    const refreshResult = await authService.refresh(oldRefresh);
    expect(refreshResult.accessToken).toBeDefined();
    expect(refreshResult.refreshToken).toBeDefined();
    expect(refreshResult.refreshToken).not.toBe(oldRefresh);

    // Verify that the old refresh token is now revoked
    await expect(
      authService.refresh(oldRefresh)
    ).rejects.toThrow(UnauthorizedError);
  });

  it('should successfully revoke refresh token upon logout', async () => {
    const regResult = await authService.register('LogoutUser', 'logout@stayos.com', 'logoutPass');
    const token = regResult.tokens.refreshToken;

    await authService.logout(token);

    // Verify token is revoked and cannot be used
    await expect(
      authService.refresh(token)
    ).rejects.toThrow(UnauthorizedError);
  });

  it('should execute the atomic registerAndOnboard successfully', async () => {
    const result = await authService.registerAndOnboard({
      userName: 'Onboarder',
      email: 'onboard@stayos.com',
      passwordHash: 'secretPass123',
      orgName: 'Azure Resort Group',
      orgSlug: 'azure-resort',
      businessName: 'Azure Haven Resort',
      businessType: 'RESORT',
      businessPhone: '+91 99999 88888',
      businessAddress: 'Baga Goa',
      businessCity: 'Goa',
      businessCountry: 'India',
      currency: 'INR',
      timezone: 'IST'
    });

    expect(result.user).toBeDefined();
    expect(result.user.name).toBe('Onboarder');
    expect(result.organization).toBeDefined();
    expect(result.organization.name).toBe('Azure Resort Group');
    expect(result.organization.slug).toBe('azure-resort');
    expect(result.business).toBeDefined();
    expect(result.business.name).toBe('Azure Haven Resort');
    expect(result.business.organizationId.toString()).toBe(result.organization.id);

    // Check user membership update
    expect(result.user.organizations.length).toBe(1);
    expect(result.user.organizations[0].organizationId.toString()).toBe(result.organization.id);
    expect(result.user.organizations[0].role).toBe('OWNER');

    // Check tokens
    expect(result.tokens).toBeDefined();
    expect(result.tokens.accessToken).toBeDefined();
  });
});
