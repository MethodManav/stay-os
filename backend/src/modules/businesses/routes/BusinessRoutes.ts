import { Router } from 'express';
import { BusinessController } from '../controllers/BusinessController';
import { AuthMiddleware } from '../../../core/middleware/AuthMiddleware';
import { TenantMiddleware } from '../../../core/middleware/TenantMiddleware';
import { authorizeRoles } from '../../../core/middleware/RBACMiddleware';
import { validateRequest } from '../../../core/middleware/ValidationMiddleware';
import { createBusinessSchema, updateBusinessSchema } from '../validators/BusinessValidator';

export const createBusinessRouter = (controller: BusinessController): Router => {
  const router = Router();

  // Create business profile (Restricted to OWNER and ADMIN of the active tenant)
  router.post(
    '/',
    AuthMiddleware,
    TenantMiddleware,
    authorizeRoles('OWNER', 'ADMIN'),
    validateRequest({ body: createBusinessSchema }),
    controller.create
  );

  // Retrieve current tenant business profile (Open to OWNER, ADMIN, MANAGER, and STAFF)
  router.get(
    '/me',
    AuthMiddleware,
    TenantMiddleware,
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.getMe
  );

  // Update current tenant business profile (Restricted to OWNER and ADMIN)
  router.patch(
    '/me',
    AuthMiddleware,
    TenantMiddleware,
    authorizeRoles('OWNER', 'ADMIN'),
    validateRequest({ body: updateBusinessSchema }),
    controller.updateMe
  );

  return router;
};

export default createBusinessRouter;
