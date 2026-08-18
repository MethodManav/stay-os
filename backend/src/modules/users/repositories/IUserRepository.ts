import { IUser, IUserDocument } from '../models/UserModel';

export interface IUserRepository {
  create(user: Partial<IUser>): Promise<IUserDocument>;
  findById(id: string): Promise<IUserDocument | null>;
  findByEmail(email: string): Promise<IUserDocument | null>;
  update(id: string, data: Partial<IUser>): Promise<IUserDocument | null>;
  addOrganization(userId: string, organizationId: string, role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF'): Promise<IUserDocument | null>;
}
