import { Types, ClientSession } from 'mongoose';
import { IUserRepository } from './IUserRepository';
import { UserModel, IUser, IUserDocument } from '../models/UserModel';

export class MongoUserRepository implements IUserRepository {
  public async create(user: Partial<IUser>, session?: ClientSession): Promise<IUserDocument> {
    const newUser = new UserModel(user);
    return newUser.save({ session });
  }

  public async findById(id: string, session?: ClientSession): Promise<IUserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return UserModel.findById(id).session(session || null).exec();
  }

  public async findByEmail(email: string, session?: ClientSession): Promise<IUserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).session(session || null).exec();
  }

  public async update(id: string, data: Partial<IUser>, session?: ClientSession): Promise<IUserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return UserModel.findByIdAndUpdate(id, data, { new: true, session }).exec();
  }

  public async addOrganization(
    userId: string,
    organizationId: string,
    role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF',
    session?: ClientSession
  ): Promise<IUserDocument | null> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(organizationId)) return null;
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          organizations: { organizationId: new Types.ObjectId(organizationId), role }
        }
      },
      { new: true, session }
    ).exec();
  }
}
export default MongoUserRepository;
