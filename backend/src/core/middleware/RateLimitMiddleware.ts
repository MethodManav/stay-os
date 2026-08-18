import rateLimit from 'express-rate-limit';
import { AppConfig } from '../../config/AppConfig';

export const RateLimitMiddleware = rateLimit({
  windowMs: AppConfig.rateLimit.windowMs,
  max: AppConfig.rateLimit.max,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: AppConfig.rateLimit.message
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});
export default RateLimitMiddleware;
