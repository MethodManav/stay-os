import { IWebsite, IWebsiteDocument } from '../models/WebsiteModel';

export interface IWebsiteRepository {
  create(website: Partial<IWebsite>): Promise<IWebsiteDocument>;
  findById(organizationId: string, id: string): Promise<IWebsiteDocument | null>;
  findByBusinessId(organizationId: string, businessId: string): Promise<IWebsiteDocument | null>;
  findBySubdomain(subdomain: string): Promise<IWebsiteDocument | null>;
  findByCustomDomain(customDomain: string): Promise<IWebsiteDocument | null>;
  update(organizationId: string, id: string, data: Partial<IWebsite>): Promise<IWebsiteDocument | null>;
}
