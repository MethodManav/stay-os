import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { AuthMiddleware } from '../../../core/middleware/AuthMiddleware';
import { SuperAdminMiddleware } from '../../../core/middleware/SuperAdminMiddleware';
import { validateRequest } from '../../../core/middleware/ValidationMiddleware';
import { registerHotelSchema } from '../validators/AdminValidator';

export const createAdminRouter = (controller: AdminController): Router => {
  const router = Router();

  // Create hotel tenant (Super Admin only)
  router.post(
    '/hotels',
    AuthMiddleware,
    SuperAdminMiddleware,
    validateRequest({ body: registerHotelSchema }),
    controller.registerHotel
  );

  // Get all hotels with their businesses
  router.get(
    '/hotels',
    AuthMiddleware,
    SuperAdminMiddleware,
    controller.getAllHotels
  );

  // Approve a hotel (Organization and its Business)
  router.patch(
    '/hotels/:id/approve',
    AuthMiddleware,
    SuperAdminMiddleware,
    controller.approveHotel
  );

  return router;
};

export default createAdminRouter;
