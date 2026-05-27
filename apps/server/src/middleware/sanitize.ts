import type { Request, Response, NextFunction } from 'express';

function sanitize(value: any): any {
  if (typeof value === 'string') {
    return value
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Remove <script> tags
      .replace(/<[^>]*>/g, '') // Strip all other HTML tags
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Strip inline handlers like onload=""
      .replace(/on\w+\s*=\s*'[^']*'/gi, '') // Strip inline handlers like onload=''
      .trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  if (value !== null && typeof value === 'object') {
    const cleanObj: any = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        cleanObj[key] = sanitize(value[key]);
      }
    }
    return cleanObj;
  }
  return value;
}

export function sanitizeInputMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
}

export default sanitizeInputMiddleware;
