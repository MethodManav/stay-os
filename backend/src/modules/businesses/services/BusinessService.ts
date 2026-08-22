import { IBusinessRepository } from '../repositories/IBusinessRepository';
import { IBusiness, IBusinessDocument } from '../models/BusinessModel';
import { NotFoundError } from '../../../core/errors/NotFoundError';
import { ConflictError } from '../../../core/errors/ConflictError';

export class BusinessService {
  constructor(private readonly businessRepository: IBusinessRepository) {}

  public async createBusiness(organizationId: string, data: Partial<IBusiness>): Promise<IBusinessDocument> {
    const existing = await this.businessRepository.findByOrganizationId(organizationId);
    if (existing) {
      throw new ConflictError('A business has already been registered for this organization');
    }

    if (data.slug) {
      const slugExists = await this.businessRepository.findBySlug(data.slug);
      if (slugExists) {
        throw new ConflictError('A business with this slug already exists');
      }
    }

    const business = await this.businessRepository.create({
      ...data,
      organizationId: organizationId as any,
      status: 'PENDING'
    });

    return business;
  }

  public async getBusinessByOrganization(organizationId: string): Promise<IBusinessDocument> {
    const business = await this.businessRepository.findByOrganizationId(organizationId);
    if (!business) {
      throw new NotFoundError('Business details not configured for this organization');
    }
    return business;
  }

  public async updateBusinessByOrganization(
    organizationId: string,
    data: Partial<IBusiness>
  ): Promise<IBusinessDocument> {
    const business = await this.businessRepository.findByOrganizationId(organizationId);
    if (!business) {
      throw new NotFoundError('Business details not configured for this organization');
    }

    if (data.slug && data.slug !== business.slug) {
      const slugExists = await this.businessRepository.findBySlug(data.slug);
      if (slugExists) {
        throw new ConflictError('A business with this slug already exists');
      }
    }

    const updated = await this.businessRepository.update(organizationId, business.id, data);
    if (!updated) {
      throw new NotFoundError('Business details could not be updated');
    }

    return updated;
  }

  public async getBusinessBySlug(slug: string): Promise<IBusinessDocument> {
    const business = await this.businessRepository.findBySlug(slug);
    if (!business) {
      throw new NotFoundError(`Property with slug '${slug}' was not found`);
    }
    return business;
  }
}
export default BusinessService;
