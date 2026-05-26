import type { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';

export class AuthController {
  public signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, email, role } = req.body;
      const result = await authService.signup(username, email, role);

      res.status(201).json({
        success: true,
        message: 'Educator user signed up successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Successfully logged in to Veda AI workspace',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
export default authController;
