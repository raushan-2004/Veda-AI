import { Router } from 'express';

// Import route modules (add as you build them)
// import { authRouter } from './auth';
// import { assessmentRouter } from './assessments';
// import { submissionRouter } from './submissions';
// import { userRouter } from './users';

export const apiRouter = Router();

// ==================== Route Mounting ====================
// apiRouter.use('/auth', authRouter);
// apiRouter.use('/assessments', assessmentRouter);
// apiRouter.use('/submissions', submissionRouter);
// apiRouter.use('/users', userRouter);

// ==================== API Status ====================
apiRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Veda AI API v1',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});
