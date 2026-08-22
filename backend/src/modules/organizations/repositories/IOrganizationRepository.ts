import { IOrganization, IOrganizationDocument } from '../models/OrganizationModel';
import { ClientSession } from 'mongoose';

export interface IOrganizationRepository {
  create(org: Partial<IOrganization>, session?: ClientSession): Promise<IOrganizationDocument>;
  findById(id: string, session?: ClientSession): Promise<IOrganizationDocument | null>;
  findBySlug(slug: string, session?: ClientSession): Promise<IOrganizationDocument | null>;
  update(id: string, data: Partial<IOrganization>, session?: ClientSession): Promise<IOrganizationDocument | null>;
  delete(id: string, session?: ClientSession): Promise<boolean>;
}
