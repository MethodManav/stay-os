import { Router } from 'express';
import { PublicController } from '../controllers/PublicController';
import { validateRequest } from '../../../core/middleware/ValidationMiddleware';
import rateLimit from 'express-rate-limit';
import { createBookingSchema } from '../../bookings/validators/BookingValidator';

// Strict rate limiter for public reservation submissions to protect against automated spam/abuse
const publicBookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 reservation creations per hour
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_BOOKINGS_ABUSE',
      message: 'Too many booking submissions from this network. Please try again after an hour.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const createPublicRouter = (controller: PublicController): Router => {
  const router = Router();

  // Public hotel landing page data resolver (fetches business profile & active website theme/sections)
  router.get('/:slug', controller.getBusinessBySlug);
  
  // Public room catalog list
  router.get('/:slug/rooms', controller.getRoomTypes);
  
  // Public room type availability date-range checker
  router.get('/:slug/availability', controller.checkAvailability);
  
  // Public reservation creation endpoint
  router.post(
    '/:slug/bookings',
    publicBookingLimiter,
    validateRequest({ body: createBookingSchema }),
    controller.createBooking
  );

  return router;
};

export default createPublicRouter;
