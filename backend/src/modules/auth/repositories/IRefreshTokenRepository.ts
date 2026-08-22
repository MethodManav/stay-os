import { IRefreshTokenDocument } from '../models/RefreshTokenModel';
import { ClientSession } from 'mongoose';

export interface IRefreshTokenRepository {
  create(userId: string, token: string, expiresAt: Date, session?: ClientSession): Promise<IRefreshTokenDocument>;
  findByToken(token: string, session?: ClientSession): Promise<IRefreshTokenDocument | null>;
  revoke(token: string, session?: ClientSession): Promise<void>;
  revokeAllForUser(userId: string, session?: ClientSession): Promise<void>;
  rotate(oldToken: string, newToken: string, expiresAt: Date, session?: ClientSession): Promise<IRefreshTokenDocument>;
}
