import { Types } from 'mongoose';
import { IOrganizationRepository } from './IOrganizationRepository';
import { OrganizationModel, IOrganization, IOrganizationDocument } from '../models/OrganizationModel';

export class MongoOrganizationRepository implements IOrganizationRepository {
  public async create(org: Partial<IOrganization>): Promise<IOrganizationDocument> {
    const newOrg = new OrganizationModel(org);
    return newOrg.save();
  }

  public async findById(id: string): Promise<IOrganizationDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return OrganizationModel.findById(id).exec();
  }

  public async findBySlug(slug: string): Promise<IOrganizationDocument | null> {
    return OrganizationModel.findOne({ slug: slug.toLowerCase() }).exec();
  }

  public async update(id: string, data: Partial<IOrganization>): Promise<IOrganizationDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return OrganizationModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  public async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await OrganizationModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
export default MongoOrganizationRepository;
