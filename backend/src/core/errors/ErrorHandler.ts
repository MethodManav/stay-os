import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { ValidationError } from './ValidationError';
import { Logger } from '../../shared/utils/Logger';
import { AppConfig } from '../../config/AppConfig';

export const ErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    
    if (err instanceof ValidationError) {
      details = err.errors;
    }
  } else if (err.name === 'ValidationError') {
    // Handling Mongoose Validation Errors
    statusCode = 400;
    errorCode = 'DATABASE_VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'CastError') {
    // Handling Mongoose Cast Errors (invalid ObjectIDs)
    statusCode = 400;
    errorCode = 'INVALID_RESOURCE_ID';
    message = 'The provided ID format is invalid';
  } else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    // Handling MongoDB Duplicate Key Errors
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY_ERROR';
    const fields = Object.keys((err as any).keyValue || {});
    message = `Duplicate value for field(s): ${fields.join(', ')}. Must be unique.`;
  }

  // Log error
  Logger.error(`${req.method} ${req.originalUrl} - ${errorCode}: ${err.message}`, {
    error: {
      name: err.name,
      message: err.message,
      stack: AppConfig.isProduction ? undefined : err.stack,
      details
    }
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details ? { details } : {}),
      ...(AppConfig.isProduction ? {} : { stack: err.stack })
    }
  });
};
