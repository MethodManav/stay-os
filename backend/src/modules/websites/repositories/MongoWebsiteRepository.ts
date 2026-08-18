import { Types } from 'mongoose';
import { IWebsiteRepository } from './IWebsiteRepository';
import { WebsiteModel, IWebsite, IWebsiteDocument } from '../models/WebsiteModel';

export class MongoWebsiteRepository implements IWebsiteRepository {
  public async create(website: Partial<IWebsite>): Promise<IWebsiteDocument> {
    const newWebsite = new WebsiteModel(website);
    return newWebsite.save();
  }

  public async findById(organizationId: string, id: string): Promise<IWebsiteDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return WebsiteModel.findOne({
      _id: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId)
    }).exec();
  }

  public async findByBusinessId(organizationId: string, businessId: string): Promise<IWebsiteDocument | null> {
    if (!Types.ObjectId.isValid(businessId) || !Types.ObjectId.isValid(organizationId)) return null;
    return WebsiteModel.findOne({
      businessId: new Types.ObjectId(businessId),
      organizationId: new Types.ObjectId(organizationId)
    }).exec();
  }

  public async findBySubdomain(subdomain: string): Promise<IWebsiteDocument | null> {
    return WebsiteModel.findOne({ subdomain: subdomain.toLowerCase() }).exec();
  }

  public async findByCustomDomain(customDomain: string): Promise<IWebsiteDocument | null> {
    return WebsiteModel.findOne({ customDomain: customDomain.toLowerCase() }).exec();
  }

  public async update(
    organizationId: string,
    id: string,
    data: Partial<IWebsite>
  ): Promise<IWebsiteDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return WebsiteModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        organizationId: new Types.ObjectId(organizationId)
      },
      data,
      { new: true }
    ).exec();
  }
}
export default MongoWebsiteRepository;
