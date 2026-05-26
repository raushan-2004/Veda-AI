import { Router } from 'express';
import { authRouter } from './auth.routes';
import { assessmentRouter } from './assessment.routes';

export const apiRouter = Router();

// ==================== Route Mounting ====================
apiRouter.use('/auth', authRouter);
apiRouter.use('/assessments', assessmentRouter);

// ==================== API Status ====================
apiRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Veda AI API v1',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});
