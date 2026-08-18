import { Types } from 'mongoose';
import { IUserRepository } from './IUserRepository';
import { UserModel, IUser, IUserDocument } from '../models/UserModel';

export class MongoUserRepository implements IUserRepository {
  public async create(user: Partial<IUser>): Promise<IUserDocument> {
    const newUser = new UserModel(user);
    return newUser.save();
  }

  public async findById(id: string): Promise<IUserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return UserModel.findById(id).exec();
  }

  public async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).exec();
  }

  public async update(id: string, data: Partial<IUser>): Promise<IUserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return UserModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  public async addOrganization(
    userId: string,
    organizationId: string,
    role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF'
  ): Promise<IUserDocument | null> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(organizationId)) return null;
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          organizations: { organizationId: new Types.ObjectId(organizationId), role }
        }
      },
      { new: true }
    ).exec();
  }
}
export default MongoUserRepository;
