import type { Request, Response, NextFunction } from 'express';

import type { ApiResponse } from '@veda-ai/types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : 'Internal server error';
  const code = isAppError ? err.code : 'INTERNAL_ERROR';

  // Don't log operational errors in production (they're expected)
  if (!isAppError || statusCode >= 500) {
    console.error('[Error]', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  }

  const response: ApiResponse = {
    success: false,
    error: message,
    ...(code && { message: code }),
  };

  res.status(statusCode).json(response);
}
