import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { validate } from '@/middleware/validate';
import { LoginSchema, SignupSchema } from '@/validators/auth.validator';
import { authRateLimiter } from '@/middleware/rateLimiter';

export const authRouter = Router();

authRouter.post('/signup', authRateLimiter, validate(SignupSchema), authController.signup);
authRouter.post('/login', authRateLimiter, validate(LoginSchema), authController.login);

export default authRouter;
