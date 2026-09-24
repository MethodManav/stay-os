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
  const getMiddlewares = [
    AuthMiddleware,
    TenantMiddleware,
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF')
  ];
  router.get('/', ...getMiddlewares, controller.getMe);
  router.get('/me', ...getMiddlewares, controller.getMe);
  router.get('/profile', ...getMiddlewares, controller.getMe);

  // Update current tenant business profile (Restricted to OWNER and ADMIN)
  const updateMiddlewares = [
    AuthMiddleware,
    TenantMiddleware,
    authorizeRoles('OWNER', 'ADMIN'),
    validateRequest({ body: updateBusinessSchema })
  ];

  router.patch('/', ...updateMiddlewares, controller.updateMe);
  router.put('/', ...updateMiddlewares, controller.updateMe);
  router.patch('/me', ...updateMiddlewares, controller.updateMe);
  router.put('/me', ...updateMiddlewares, controller.updateMe);
  router.patch('/profile', ...updateMiddlewares, controller.updateMe);
  router.put('/profile', ...updateMiddlewares, controller.updateMe);
  router.patch('/:id', ...updateMiddlewares, controller.updateMe);
  router.put('/:id', ...updateMiddlewares, controller.updateMe);

  return router;
};

export default createBusinessRouter;
