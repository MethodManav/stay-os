import { IOrganization, IOrganizationDocument } from '../models/OrganizationModel';

export interface IOrganizationRepository {
  create(org: Partial<IOrganization>): Promise<IOrganizationDocument>;
  findById(id: string): Promise<IOrganizationDocument | null>;
  findBySlug(slug: string): Promise<IOrganizationDocument | null>;
  update(id: string, data: Partial<IOrganization>): Promise<IOrganizationDocument | null>;
  delete(id: string): Promise<boolean>;
}
