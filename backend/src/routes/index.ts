import { Router } from 'express';
import {
  authRouter,
  organizationRouter,
  businessRouter,
  roomRouter,
  guestRouter,
  bookingRouter,
  websiteRouter,
  paymentRouter,
  aiRouter,
  analyticsRouter,
  publicRouter
} from '../core/bootstrap';

const rootRouter = Router();

// Health check endpoint
rootRouter.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'StayOS API service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Register Module Routers
rootRouter.use('/auth', authRouter);
rootRouter.use('/organizations', organizationRouter);
rootRouter.use('/businesses', businessRouter);
rootRouter.use('/rooms', roomRouter);
rootRouter.use('/guests', guestRouter);
rootRouter.use('/bookings', bookingRouter);
rootRouter.use('/websites', websiteRouter);
rootRouter.use('/payments', paymentRouter);
rootRouter.use('/ai', aiRouter);
rootRouter.use('/analytics', analyticsRouter);
rootRouter.use('/public/businesses', publicRouter);

export default rootRouter;
