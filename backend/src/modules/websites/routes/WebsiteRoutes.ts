import { Router } from 'express';
import { WebsiteController } from '../controllers/WebsiteController';
import { AuthMiddleware } from '../../../core/middleware/AuthMiddleware';
import { TenantMiddleware } from '../../../core/middleware/TenantMiddleware';
import { BusinessContextMiddleware } from '../../../core/middleware/BusinessContextMiddleware';
import { authorizeRoles } from '../../../core/middleware/RBACMiddleware';
import { validateRequest } from '../../../core/middleware/ValidationMiddleware';
import { createWebsiteSchema, updateWebsiteSchema } from '../validators/WebsiteValidator';

export const createWebsiteRouter = (controller: WebsiteController): Router => {
  const router = Router();

  router.use(AuthMiddleware);
  router.use(TenantMiddleware);
  router.use(BusinessContextMiddleware);

  // Setup website profile (Restricted to OWNER and ADMIN of the active tenant)
  router.post(
    '/',
    authorizeRoles('OWNER', 'ADMIN'),
    validateRequest({ body: createWebsiteSchema }),
    controller.create
  );

  // Retrieve current tenant website profile (Open to OWNER, ADMIN, MANAGER, and STAFF)
  router.get(
    '/me',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.getMe
  );

  // Update current tenant website profile (Restricted to OWNER and ADMIN)
  router.patch(
    '/me',
    authorizeRoles('OWNER', 'ADMIN'),
    validateRequest({ body: updateWebsiteSchema }),
    controller.updateMe
  );

  return router;
};

export default createWebsiteRouter;
