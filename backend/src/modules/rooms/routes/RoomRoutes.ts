import { Router } from 'express';
import { RoomController } from '../controllers/RoomController';
import { AuthMiddleware } from '../../../core/middleware/AuthMiddleware';
import { TenantMiddleware } from '../../../core/middleware/TenantMiddleware';
import { BusinessContextMiddleware } from '../../../core/middleware/BusinessContextMiddleware';
import { authorizeRoles } from '../../../core/middleware/RBACMiddleware';
import { validateRequest } from '../../../core/middleware/ValidationMiddleware';
import { createRoomSchema, updateRoomSchema, createRoomTypeSchema, updateRoomTypeSchema } from '../validators/RoomValidator';

// Router factory for /api/v1/rooms
export const createRoomRouter = (controller: RoomController): Router => {
  const router = Router();

  router.use(AuthMiddleware);
  router.use(TenantMiddleware);
  router.use(BusinessContextMiddleware);

  router.post(
    '/',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    validateRequest({ body: createRoomSchema }),
    controller.createRoom
  );

  router.get(
    '/',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.getRooms
  );

  router.get(
    '/:id',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.getRoomById
  );

  router.patch(
    '/:id',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    validateRequest({ body: updateRoomSchema }),
    controller.updateRoom
  );

  router.delete(
    '/:id',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    controller.deleteRoom
  );

  return router;
};

// Router factory for /api/v1/room-types
export const createRoomTypeRouter = (controller: RoomController): Router => {
  const router = Router();

  router.use(AuthMiddleware);
  router.use(TenantMiddleware);
  router.use(BusinessContextMiddleware);

  router.post(
    '/',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    validateRequest({ body: createRoomTypeSchema }),
    controller.createRoomType
  );

  router.get(
    '/',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.getRoomTypes
  );

  router.get(
    '/:id',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.getRoomTypeById
  );

  router.patch(
    '/:id',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    validateRequest({ body: updateRoomTypeSchema }),
    controller.updateRoomType
  );

  router.delete(
    '/:id',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    controller.deleteRoomType
  );

  return router;
};
