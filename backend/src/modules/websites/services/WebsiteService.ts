import { IWebsiteRepository } from '../repositories/IWebsiteRepository';
import { IWebsite, IWebsiteDocument } from '../models/WebsiteModel';
import { NotFoundError } from '../../../core/errors/NotFoundError';
import { ConflictError } from '../../../core/errors/ConflictError';

export class WebsiteService {
  constructor(private readonly websiteRepository: IWebsiteRepository) {}

  public async createWebsite(
    organizationId: string,
    businessId: string,
    data: Partial<IWebsite>
  ): Promise<IWebsiteDocument> {
    const existing = await this.websiteRepository.findByBusinessId(organizationId, businessId);
    if (existing) {
      throw new ConflictError('A website configuration already exists for this business');
    }

    if (data.subdomain) {
      const subExists = await this.websiteRepository.findBySubdomain(data.subdomain);
      if (subExists) {
        throw new ConflictError(`Subdomain '${data.subdomain}' is already taken`);
      }
    }

    if (data.customDomain) {
      const domExists = await this.websiteRepository.findByCustomDomain(data.customDomain);
      if (domExists) {
        throw new ConflictError(`Custom domain '${data.customDomain}' is already in use`);
      }
    }

    return this.websiteRepository.create({
      ...data,
      organizationId: organizationId as any,
      businessId: businessId as any,
      published: false
    });
  }

  public async getWebsiteByBusiness(organizationId: string, businessId: string): Promise<IWebsiteDocument> {
    const website = await this.websiteRepository.findByBusinessId(organizationId, businessId);
    if (!website) {
      throw new NotFoundError('Website configuration not found. Please create one.');
    }
    return website;
  }

  public async updateWebsiteByBusiness(
    organizationId: string,
    businessId: string,
    data: Partial<IWebsite>
  ): Promise<IWebsiteDocument> {
    const website = await this.websiteRepository.findByBusinessId(organizationId, businessId);
    if (!website) {
      throw new NotFoundError('Website configuration not found');
    }

    if (data.subdomain && data.subdomain !== website.subdomain) {
      const subExists = await this.websiteRepository.findBySubdomain(data.subdomain);
      if (subExists) {
        throw new ConflictError(`Subdomain '${data.subdomain}' is already taken`);
      }
    }

    if (data.customDomain && data.customDomain !== website.customDomain) {
      const domExists = await this.websiteRepository.findByCustomDomain(data.customDomain);
      if (domExists) {
        throw new ConflictError(`Custom domain '${data.customDomain}' is already in use`);
      }
    }

    const updated = await this.websiteRepository.update(organizationId, website.id, data);
    if (!updated) {
      throw new NotFoundError('Website configuration could not be updated');
    }

    return updated;
  }

  public async getPublicWebsite(domainOrSubdomain: string): Promise<IWebsiteDocument> {
    let website = await this.websiteRepository.findBySubdomain(domainOrSubdomain);
    if (!website) {
      website = await this.websiteRepository.findByCustomDomain(domainOrSubdomain);
    }

    if (!website || !website.published) {
      throw new NotFoundError('Website not found or is currently unpublished');
    }

    return website;
  }
}
export default WebsiteService;
