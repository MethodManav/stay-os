import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { AppConfig } from './config/AppConfig';
import { Logger } from './shared/utils/Logger';
import { ErrorHandler } from './core/errors/ErrorHandler';
import { NotFoundError } from './core/errors/NotFoundError';
import rootRouter from './routes';
// import { RateLimitMiddleware } from './core/middleware/RateLimitMiddleware';

const app = express();

// Set security headers
app.use(helmet());

// Cross-Origin Resource Sharing configuration
app.use(
  cors({
    origin: AppConfig.clientUrl,
    credentials: true
  })
);

// Payload parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Wire Morgan HTTP logging to Winston
const morganMiddleware = morgan(
  ':remote-addr - :method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => Logger.info(message.trim())
    }
  }
);
app.use(morganMiddleware);

// Apply rate limiting to all requests
// app.use(RateLimitMiddleware);

// Register API routes
app.use('/api/v1', rootRouter);

// Fallback for unmatched routes (HTTP 404)
app.use((req, _res, next) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// Register global error middleware (must be registered last)
app.use(ErrorHandler);

export default app;
