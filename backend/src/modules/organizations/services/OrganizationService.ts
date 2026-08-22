import { IOrganizationRepository } from '../repositories/IOrganizationRepository';
import { IUserRepository } from '../../users/repositories/IUserRepository';
import { IOrganization, IOrganizationDocument } from '../models/OrganizationModel';
import { ConflictError } from '../../../core/errors/ConflictError';
import { NotFoundError } from '../../../core/errors/NotFoundError';
import { ForbiddenError } from '../../../core/errors/ForbiddenError';

export class OrganizationService {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    private readonly userRepository: IUserRepository
  ) {}

  public async createOrganization(name: string, slug: string, ownerId: string): Promise<IOrganizationDocument> {
    const existing = await this.organizationRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError('An organization with this slug already exists');
    }

    const org = await this.organizationRepository.create({
      name,
      slug,
      ownerId: ownerId as any,
      status: 'PENDING'
    });

    // Add OWNER membership to the user
    await this.userRepository.addOrganization(ownerId, org.id, 'OWNER');

    return org;
  }

  public async getOrganization(id: string, userOrgs: { organizationId: string }[]): Promise<IOrganizationDocument> {
    // Verify membership
    const isMember = userOrgs.some(org => org.organizationId === id);
    if (!isMember) {
      throw new ForbiddenError('You do not have access to this organization');
    }

    const org = await this.organizationRepository.findById(id);
    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    return org;
  }

  public async updateOrganization(id: string, data: Partial<IOrganization>): Promise<IOrganizationDocument> {
    const org = await this.organizationRepository.findById(id);
    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    if (data.slug) {
      const existing = await this.organizationRepository.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new ConflictError('An organization with this slug already exists');
      }
    }

    const updated = await this.organizationRepository.update(id, data);
    if (!updated) {
      throw new NotFoundError('Organization not found');
    }

    return updated;
  }

  public async deleteOrganization(id: string): Promise<void> {
    const org = await this.organizationRepository.findById(id);
    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    await this.organizationRepository.delete(id);
  }
}
export default OrganizationService;
