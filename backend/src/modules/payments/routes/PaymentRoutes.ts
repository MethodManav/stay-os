import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { AuthMiddleware } from '../../../core/middleware/AuthMiddleware';
import { TenantMiddleware } from '../../../core/middleware/TenantMiddleware';
import { BusinessContextMiddleware } from '../../../core/middleware/BusinessContextMiddleware';
import { authorizeRoles } from '../../../core/middleware/RBACMiddleware';
import { validateRequest } from '../../../core/middleware/ValidationMiddleware';
import { processPaymentSchema, processRefundSchema } from '../validators/PaymentValidator';

export const createPaymentRouter = (controller: PaymentController): Router => {
  const router = Router();

  router.use(AuthMiddleware);
  router.use(TenantMiddleware);
  router.use(BusinessContextMiddleware);

  // Process a charge (Restricted to OWNER, ADMIN, and MANAGER)
  router.post(
    '/charge',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    validateRequest({ body: processPaymentSchema }),
    controller.charge
  );

  // Process a refund (Restricted to OWNER, ADMIN, and MANAGER)
  router.post(
    '/refund',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER'),
    validateRequest({ body: processRefundSchema }),
    controller.refund
  );

  return router;
};

export default createPaymentRouter;
