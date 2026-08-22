import { IUser, IUserDocument } from '../models/UserModel';
import { ClientSession } from 'mongoose';

export interface IUserRepository {
  create(user: Partial<IUser>, session?: ClientSession): Promise<IUserDocument>;
  findById(id: string, session?: ClientSession): Promise<IUserDocument | null>;
  findByEmail(email: string, session?: ClientSession): Promise<IUserDocument | null>;
  update(id: string, data: Partial<IUser>, session?: ClientSession): Promise<IUserDocument | null>;
  addOrganization(userId: string, organizationId: string, role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF', session?: ClientSession): Promise<IUserDocument | null>;
}
