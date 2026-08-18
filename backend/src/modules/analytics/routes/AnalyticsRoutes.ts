import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { AuthMiddleware } from '../../../core/middleware/AuthMiddleware';
import { TenantMiddleware } from '../../../core/middleware/TenantMiddleware';
import { BusinessContextMiddleware } from '../../../core/middleware/BusinessContextMiddleware';
import { authorizeRoles } from '../../../core/middleware/RBACMiddleware';
import { validateRequest } from '../../../core/middleware/ValidationMiddleware';
import { queryMetricsSchema } from '../validators/AnalyticsValidator';

export const createAnalyticsRouter = (controller: AnalyticsController): Router => {
  const router = Router();

  router.use(AuthMiddleware);
  router.use(TenantMiddleware);
  router.use(BusinessContextMiddleware);

  // Restricted analytics metrics query (Only allowed for OWNER and ADMIN roles)
  router.get(
    '/',
    authorizeRoles('OWNER', 'ADMIN'),
    validateRequest({ query: queryMetricsSchema }),
    controller.getMetrics
  );

  return router;
};

export default createAnalyticsRouter;
