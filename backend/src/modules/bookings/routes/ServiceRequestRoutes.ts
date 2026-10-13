import { Router } from 'express';
import { ServiceRequestController } from '../controllers/ServiceRequestController';
import { AuthMiddleware } from '../../../core/middleware/AuthMiddleware';
import { TenantMiddleware } from '../../../core/middleware/TenantMiddleware';
import { BusinessContextMiddleware } from '../../../core/middleware/BusinessContextMiddleware';

export const createServiceRequestRouter = (controller: ServiceRequestController): Router => {
  const router = Router();

  router.use(AuthMiddleware);
  router.use(TenantMiddleware);
  router.use(BusinessContextMiddleware);

  // Get service requests for active property
  router.get('/', controller.getMany);

  // Create service request manually
  router.post('/', controller.create);

  // Update status (scheduled, in_progress, completed, cancelled)
  router.patch('/:id/status', controller.updateStatus);
  router.patch('/:id', controller.updateStatus);

  // Delete / archive
  router.delete('/:id', controller.delete);

  return router;
};
