import type { Request, Response, NextFunction } from 'express';

import type { ApiResponse } from '@veda-ai/types';

export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  const response: ApiResponse = {
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  };
  res.status(404).json(response);
}
