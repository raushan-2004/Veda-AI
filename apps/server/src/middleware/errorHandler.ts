import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { env } from '@/config/env';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] | undefined = undefined;

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map((e) => ({
      field: e.path.join('.').replace(/^(body|query|params)\./, ''),
      message: e.message,
    }));
  }
  // 2. Custom App Error
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // 3. Mongoose Duplicate Key Error
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {}).join(', ') || 'field';
    message = `Duplicate entry: A record with this ${field} already exists.`;
  }
  // 4. Mongoose Cast Error
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field ${err.path}: ${err.value}`;
  }
  // 5. JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your login session has expired. Please log in again.';
  }

  // Log error using visual logger
  if (statusCode >= 500) {
    logger.error(`${message} — Stack: ${err.stack || err}`);
  } else {
    logger.warn(`Operational Warning [${statusCode}]: ${message}`, errors || '');
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
