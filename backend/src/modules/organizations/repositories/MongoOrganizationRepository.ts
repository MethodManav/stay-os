import { Types, ClientSession } from 'mongoose';
import { IOrganizationRepository } from './IOrganizationRepository';
import { OrganizationModel, IOrganization, IOrganizationDocument } from '../models/OrganizationModel';

export class MongoOrganizationRepository implements IOrganizationRepository {
  public async create(org: Partial<IOrganization>, session?: ClientSession): Promise<IOrganizationDocument> {
    const newOrg = new OrganizationModel(org);
    return newOrg.save({ session });
  }

  public async findById(id: string, session?: ClientSession): Promise<IOrganizationDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return OrganizationModel.findById(id).session(session || null).exec();
  }

  public async findBySlug(slug: string, session?: ClientSession): Promise<IOrganizationDocument | null> {
    return OrganizationModel.findOne({ slug: slug.toLowerCase() }).session(session || null).exec();
  }

  public async update(id: string, data: Partial<IOrganization>, session?: ClientSession): Promise<IOrganizationDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return OrganizationModel.findByIdAndUpdate(id, data, { new: true, session }).exec();
  }

  public async delete(id: string, session?: ClientSession): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await OrganizationModel.findByIdAndDelete(id, { session }).exec();
    return result !== null;
  }
}
export default MongoOrganizationRepository;
