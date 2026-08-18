import { Router } from 'express';
import { BookingController } from '../controllers/BookingController';
import { AuthMiddleware } from '../../../core/middleware/AuthMiddleware';
import { TenantMiddleware } from '../../../core/middleware/TenantMiddleware';
import { BusinessContextMiddleware } from '../../../core/middleware/BusinessContextMiddleware';
import { authorizeRoles } from '../../../core/middleware/RBACMiddleware';
import { validateRequest } from '../../../core/middleware/ValidationMiddleware';
import { createBookingSchema, updateBookingSchema } from '../validators/BookingValidator';

export const createBookingRouter = (controller: BookingController): Router => {
  const router = Router();

  router.use(AuthMiddleware);
  router.use(TenantMiddleware);
  router.use(BusinessContextMiddleware);

  // Create booking (Restricted to OWNER, ADMIN, and MANAGER)
  router.post(
    '/',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    validateRequest({ body: createBookingSchema }),
    controller.create
  );

  // Get all bookings (Restricted to OWNER, ADMIN, MANAGER, and STAFF)
  router.get(
    '/',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.getMany
  );

  // Get booking details (Restricted to OWNER, ADMIN, MANAGER, and STAFF)
  router.get(
    '/:id',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.getById
  );

  // Update booking details (Restricted to OWNER, ADMIN, and MANAGER)
  router.patch(
    '/:id',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    validateRequest({ body: updateBookingSchema }),
    controller.update
  );

  // Delete booking (Restricted to OWNER and ADMIN)
  router.delete(
    '/:id',
    authorizeRoles('OWNER', 'ADMIN'),
    controller.delete
  );

  // Check-in guest (Restricted to OWNER, ADMIN, and MANAGER)
  router.post(
    '/:id/check-in',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    controller.checkIn
  );

  // Check-out guest (Restricted to OWNER, ADMIN, and MANAGER)
  router.post(
    '/:id/check-out',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    controller.checkOut
  );

  // Cancel booking (Restricted to OWNER, ADMIN, and MANAGER)
  router.post(
    '/:id/cancel',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    controller.cancel
  );

  return router;
};

export default createBookingRouter;
