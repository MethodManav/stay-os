import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/ForbiddenError';

export const authorizeRoles = (...allowedRoles: ('OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF')[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user || !req.organizationId) {
        throw new ForbiddenError('Access denied: Active organization context required');
      }

      const membership = req.user.organizations.find(
        (org) => org.organizationId === req.organizationId
      );

      if (!membership) {
        throw new ForbiddenError('Access denied: You do not belong to this organization');
      }

      const hasRole = allowedRoles.includes(membership.role);
      if (!hasRole) {
        throw new ForbiddenError('Access denied: Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authorizeRoles;
