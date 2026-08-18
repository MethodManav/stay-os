import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../../../core/middleware/ValidationMiddleware';
import { AuthMiddleware } from '../../../core/middleware/AuthMiddleware';
import { registerSchema, loginSchema, refreshSchema, changePasswordSchema, registerOnboardSchema } from '../validators/AuthValidator';

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router();

  router.post('/register', validateRequest({ body: registerSchema }), authController.register);
  router.post('/register-onboard', validateRequest({ body: registerOnboardSchema }), authController.registerOnboard);
  router.post('/login', validateRequest({ body: loginSchema }), authController.login);
  router.post('/refresh', validateRequest({ body: refreshSchema }), authController.refresh);
  router.post('/logout', validateRequest({ body: refreshSchema }), authController.logout);
  
  router.get('/me', AuthMiddleware, authController.me);
  router.post('/change-password', AuthMiddleware, validateRequest({ body: changePasswordSchema }), authController.changePassword);

  return router;
};

export default createAuthRouter;
