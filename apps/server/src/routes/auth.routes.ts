import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { validate } from '@/middleware/validate';
import { LoginSchema, SignupSchema } from '@/validators/auth.validator';

export const authRouter = Router();

authRouter.post('/signup', validate(SignupSchema), authController.signup);
authRouter.post('/login', validate(LoginSchema), authController.login);

export default authRouter;
