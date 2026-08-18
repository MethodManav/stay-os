import { Router } from 'express';
import { GuestController } from '../controllers/GuestController';
import { AuthMiddleware } from '../../../core/middleware/AuthMiddleware';
import { TenantMiddleware } from '../../../core/middleware/TenantMiddleware';
import { BusinessContextMiddleware } from '../../../core/middleware/BusinessContextMiddleware';
import { authorizeRoles } from '../../../core/middleware/RBACMiddleware';
import { validateRequest } from '../../../core/middleware/ValidationMiddleware';
import { createGuestSchema, updateGuestSchema, queryGuestSchema } from '../validators/GuestValidator';

export const createGuestRouter = (controller: GuestController): Router => {
  const router = Router();

  router.use(AuthMiddleware);
  router.use(TenantMiddleware);
  router.use(BusinessContextMiddleware);

  router.post(
    '/',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    validateRequest({ body: createGuestSchema }),
    controller.create
  );

  router.get(
    '/',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    validateRequest({ query: queryGuestSchema }),
    controller.getMany
  );

  router.get(
    '/:id',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.getById
  );

  router.patch(
    '/:id',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    validateRequest({ body: updateGuestSchema }),
    controller.update
  );

  router.delete(
    '/:id',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    controller.delete
  );

  return router;
};

export default createGuestRouter;
