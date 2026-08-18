import { Types } from 'mongoose';
import { IRefreshTokenRepository } from './IRefreshTokenRepository';
import { RefreshTokenModel, IRefreshTokenDocument } from '../models/RefreshTokenModel';

export class MongoRefreshTokenRepository implements IRefreshTokenRepository {
  public async create(userId: string, token: string, expiresAt: Date): Promise<IRefreshTokenDocument> {
    const newToken = new RefreshTokenModel({
      userId: new Types.ObjectId(userId),
      token,
      expiresAt
    });
    return newToken.save();
  }

  public async findByToken(token: string): Promise<IRefreshTokenDocument | null> {
    return RefreshTokenModel.findOne({ token }).exec();
  }

  public async revoke(token: string): Promise<void> {
    await RefreshTokenModel.updateOne({ token }, { revokedAt: new Date() }).exec();
  }

  public async revokeAllForUser(userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) return;
    await RefreshTokenModel.updateMany(
      { userId: new Types.ObjectId(userId), revokedAt: { $exists: false } },
      { revokedAt: new Date() }
    ).exec();
  }

  public async rotate(oldToken: string, newToken: string, expiresAt: Date): Promise<IRefreshTokenDocument> {
    const tokenDoc = await RefreshTokenModel.findOne({ token: oldToken }).exec();
    if (!tokenDoc) {
      throw new Error('Token to rotate not found');
    }

    tokenDoc.revokedAt = new Date();
    tokenDoc.replacedByToken = newToken;
    await tokenDoc.save();

    return this.create(tokenDoc.userId.toString(), newToken, expiresAt);
  }
}
export default MongoRefreshTokenRepository;
