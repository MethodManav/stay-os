import { IRefreshTokenDocument } from '../models/RefreshTokenModel';

export interface IRefreshTokenRepository {
  create(userId: string, token: string, expiresAt: Date): Promise<IRefreshTokenDocument>;
  findByToken(token: string): Promise<IRefreshTokenDocument | null>;
  revoke(token: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  rotate(oldToken: string, newToken: string, expiresAt: Date): Promise<IRefreshTokenDocument>;
}
