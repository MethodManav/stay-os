import { IBusiness, IBusinessDocument } from '../models/BusinessModel';

export interface IBusinessRepository {
  create(business: Partial<IBusiness>): Promise<IBusinessDocument>;
  findById(organizationId: string, id: string): Promise<IBusinessDocument | null>;
  findByOrganizationId(organizationId: string): Promise<IBusinessDocument | null>;
  findBySlug(slug: string): Promise<IBusinessDocument | null>;
  update(organizationId: string, id: string, data: Partial<IBusiness>): Promise<IBusinessDocument | null>;
}
