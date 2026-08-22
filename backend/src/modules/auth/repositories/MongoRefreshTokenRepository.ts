import { Types, ClientSession } from 'mongoose';
import { IRefreshTokenRepository } from './IRefreshTokenRepository';
import { RefreshTokenModel, IRefreshTokenDocument } from '../models/RefreshTokenModel';

export class MongoRefreshTokenRepository implements IRefreshTokenRepository {
  public async create(userId: string, token: string, expiresAt: Date, session?: ClientSession): Promise<IRefreshTokenDocument> {
    const newToken = new RefreshTokenModel({
      userId: new Types.ObjectId(userId),
      token,
      expiresAt
    });
    return newToken.save({ session });
  }

  public async findByToken(token: string, session?: ClientSession): Promise<IRefreshTokenDocument | null> {
    return RefreshTokenModel.findOne({ token }).session(session || null).exec();
  }

  public async revoke(token: string, session?: ClientSession): Promise<void> {
    await RefreshTokenModel.updateOne({ token }, { revokedAt: new Date() }, { session }).exec();
  }

  public async revokeAllForUser(userId: string, session?: ClientSession): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) return;
    await RefreshTokenModel.updateMany(
      { userId: new Types.ObjectId(userId), revokedAt: { $exists: false } },
      { revokedAt: new Date() },
      { session }
    ).exec();
  }

  public async rotate(oldToken: string, newToken: string, expiresAt: Date, session?: ClientSession): Promise<IRefreshTokenDocument> {
    const tokenDoc = await RefreshTokenModel.findOne({ token: oldToken }).session(session || null).exec();
    if (!tokenDoc) {
      throw new Error('Token to rotate not found');
    }

    tokenDoc.revokedAt = new Date();
    tokenDoc.replacedByToken = newToken;
    await tokenDoc.save({ session });

    return this.create(tokenDoc.userId.toString(), newToken, expiresAt, session);
  }
}
export default MongoRefreshTokenRepository;
