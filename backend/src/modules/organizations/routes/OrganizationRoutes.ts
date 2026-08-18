import { Router, Request, Response, NextFunction } from 'express';
import { OrganizationController } from '../controllers/OrganizationController';
import { AuthMiddleware } from '../../../core/middleware/AuthMiddleware';
import { authorizeRoles } from '../../../core/middleware/RBACMiddleware';
import { validateRequest } from '../../../core/middleware/ValidationMiddleware';
import { createOrganizationSchema, updateOrganizationSchema } from '../validators/OrganizationValidator';

// Middleware helper to set tenant context from organization ID parameter
const setTenantFromParam = (req: Request, _res: Response, next: NextFunction) => {
  req.organizationId = req.params.id;
  next();
};

export const createOrganizationRouter = (controller: OrganizationController): Router => {
  const router = Router();

  // Create organization (Any authenticated user can create an organization)
  router.post(
    '/',
    AuthMiddleware,
    validateRequest({ body: createOrganizationSchema }),
    controller.create
  );

  // Get organization details (restricted to members)
  router.get(
    '/:id',
    AuthMiddleware,
    setTenantFromParam,
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.get
  );

  // Update organization (restricted to OWNER and ADMIN)
  router.patch(
    '/:id',
    AuthMiddleware,
    setTenantFromParam,
    authorizeRoles('OWNER', 'ADMIN'),
    validateRequest({ body: updateOrganizationSchema }),
    controller.update
  );

  // Delete organization (restricted to OWNER only)
  router.delete(
    '/:id',
    AuthMiddleware,
    setTenantFromParam,
    authorizeRoles('OWNER'),
    controller.delete
  );

  return router;
};

export default createOrganizationRouter;
