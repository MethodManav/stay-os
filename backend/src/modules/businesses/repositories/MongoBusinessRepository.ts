import { Types } from 'mongoose';
import { IBusinessRepository } from './IBusinessRepository';
import { BusinessModel, IBusiness, IBusinessDocument } from '../models/BusinessModel';

export class MongoBusinessRepository implements IBusinessRepository {
  public async create(business: Partial<IBusiness>): Promise<IBusinessDocument> {
    const newBusiness = new BusinessModel(business);
    return newBusiness.save();
  }

  public async findById(organizationId: string, id: string): Promise<IBusinessDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return BusinessModel.findOne({
      _id: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId)
    }).exec();
  }

  public async findByOrganizationId(organizationId: string): Promise<IBusinessDocument | null> {
    if (!Types.ObjectId.isValid(organizationId)) return null;
    return BusinessModel.findOne({
      organizationId: new Types.ObjectId(organizationId)
    }).exec();
  }

  public async findBySlug(slug: string): Promise<IBusinessDocument | null> {
    return BusinessModel.findOne({ slug: slug.toLowerCase() }).exec();
  }

  public async update(
    organizationId: string,
    id: string,
    data: Partial<IBusiness>
  ): Promise<IBusinessDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return BusinessModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        organizationId: new Types.ObjectId(organizationId)
      },
      data,
      { new: true }
    ).exec();
  }
}
export default MongoBusinessRepository;
