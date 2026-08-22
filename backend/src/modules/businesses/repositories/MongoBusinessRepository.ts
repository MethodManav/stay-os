import { Types, ClientSession } from 'mongoose';
import { IBusinessRepository } from './IBusinessRepository';
import { BusinessModel, IBusiness, IBusinessDocument } from '../models/BusinessModel';

export class MongoBusinessRepository implements IBusinessRepository {
  public async create(business: Partial<IBusiness>, session?: ClientSession): Promise<IBusinessDocument> {
    const newBusiness = new BusinessModel(business);
    return newBusiness.save({ session });
  }

  public async findById(organizationId: string, id: string, session?: ClientSession): Promise<IBusinessDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return BusinessModel.findOne({
      _id: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId)
    }).session(session || null).exec();
  }

  public async findByOrganizationId(organizationId: string, session?: ClientSession): Promise<IBusinessDocument | null> {
    if (!Types.ObjectId.isValid(organizationId)) return null;
    return BusinessModel.findOne({
      organizationId: new Types.ObjectId(organizationId)
    }).session(session || null).exec();
  }

  public async findBySlug(slug: string, session?: ClientSession): Promise<IBusinessDocument | null> {
    return BusinessModel.findOne({ slug: slug.toLowerCase() }).session(session || null).exec();
  }

  public async update(
    organizationId: string,
    id: string,
    data: Partial<IBusiness>,
    session?: ClientSession
  ): Promise<IBusinessDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return BusinessModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        organizationId: new Types.ObjectId(organizationId)
      },
      data,
      { new: true, session }
    ).exec();
  }
}
export default MongoBusinessRepository;
