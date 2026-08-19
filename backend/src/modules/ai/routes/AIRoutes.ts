import { Router } from 'express';
import { AIController } from '../controllers/AIController';
import { AuthMiddleware } from '../../../core/middleware/AuthMiddleware';
import { TenantMiddleware } from '../../../core/middleware/TenantMiddleware';
import { BusinessContextMiddleware } from '../../../core/middleware/BusinessContextMiddleware';
import { authorizeRoles } from '../../../core/middleware/RBACMiddleware';
import { validateRequest } from '../../../core/middleware/ValidationMiddleware';
import { guestMessageSchema, kbItemSchema, conversationStatusSchema } from '../validators/AIValidator';

export const createAIRouter = (controller: AIController): Router => {
  const router = Router();

  router.use(AuthMiddleware);
  router.use(TenantMiddleware);
  router.use(BusinessContextMiddleware);

  // List conversation threads (Restricted to OWNER, ADMIN, MANAGER, and STAFF)
  router.get(
    '/conversations',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.getConversations
  );

  // Retrieve thread message history (Restricted to OWNER, ADMIN, MANAGER, and STAFF)
  router.get(
    '/conversations/:id',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.getConversationById
  );

  // Update conversation status (Restricted to OWNER, ADMIN, MANAGER, and STAFF)
  router.patch(
    '/conversations/:id',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    validateRequest({ body: conversationStatusSchema }),
    controller.updateStatus
  );

  // Append a message to conversation thread (Restricted to OWNER, ADMIN, MANAGER, and STAFF)
  router.post(
    '/conversations/:id/messages',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.addMessage
  );

  // Hook for simulating incoming guest messages
  router.post(
    '/message',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    validateRequest({ body: guestMessageSchema }),
    controller.handleGuestMessage
  );

  // Fetch FAQ knowledge base items list (Restricted to OWNER, ADMIN, MANAGER, and STAFF)
  router.get(
    '/kb',
    authorizeRoles('OWNER', 'ADMIN', 'MANAGER', 'STAFF'),
    controller.getKBItems
  );

  // Create FAQ knowledge base entry (Restricted to OWNER and ADMIN)
  router.post(
    '/kb',
    authorizeRoles('OWNER', 'ADMIN'),
    validateRequest({ body: kbItemSchema }),
    controller.createKBItem
  );

  return router;
};

export default createAIRouter;
