import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/ForbiddenError';
import { OrganizationModel } from '../../modules/organizations/models/OrganizationModel';

export const TenantMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('User authentication context is required');
    }

    let organizationId = req.headers['x-organization-id'] as string;

    if (!organizationId) {
      // Default to the first organization the user is part of
      if (req.user.organizations.length > 0) {
        organizationId = req.user.organizations[0].organizationId;
      } else {
        throw new ForbiddenError('User is not associated with any organization. Please onboard.');
      }
    }

    // Verify membership
    const membership = req.user.organizations.find(
      (org) => org.organizationId === organizationId
    );

    if (!membership) {
      throw new ForbiddenError('You do not have access to this organization');
    }

    // Fetch organization details
    const org = await OrganizationModel.findById(organizationId).exec();
    if (!org) {
      throw new ForbiddenError('Organization not found');
    }

    if (org.status !== 'ACTIVE') {
      throw new ForbiddenError('Organization is suspended');
    }

    // Attach to request
    req.organizationId = organizationId;
    req.organization = {
      id: org.id,
      name: org.name,
      slug: org.slug,
      ownerId: org.ownerId.toString()
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default TenantMiddleware;
