import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { sanitizeInputMiddleware } from './middleware/sanitize';
import { apiRouter } from './routes';

export const app = express();

// ==================== Security Middleware ====================
app.use(helmet());

// Support dynamic, comma-separated origins or reflect wildcard back to allow credential support
const allowedOrigins = env.CORS_ORIGIN === '*' 
  ? true 
  : env.CORS_ORIGIN.indexOf(',') !== -1 
    ? env.CORS_ORIGIN.split(',') 
    : env.CORS_ORIGIN;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ==================== General Middleware ====================
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInputMiddleware);

// ==================== Rate Limiting ====================
app.use('/api', rateLimiter);

// ==================== Health Check ====================
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

// ==================== API Routes ====================
app.use('/api/v1', apiRouter);

// ==================== Error Handlers ====================
app.use(notFoundHandler);
app.use(errorHandler);
