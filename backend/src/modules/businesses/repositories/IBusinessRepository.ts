import { IBusiness, IBusinessDocument } from '../models/BusinessModel';
import { ClientSession } from 'mongoose';

export interface IBusinessRepository {
  create(business: Partial<IBusiness>, session?: ClientSession): Promise<IBusinessDocument>;
  findById(organizationId: string, id: string, session?: ClientSession): Promise<IBusinessDocument | null>;
  findByOrganizationId(organizationId: string, session?: ClientSession): Promise<IBusinessDocument | null>;
  findBySlug(slug: string, session?: ClientSession): Promise<IBusinessDocument | null>;
  update(organizationId: string, id: string, data: Partial<IBusiness>, session?: ClientSession): Promise<IBusinessDocument | null>;
}
