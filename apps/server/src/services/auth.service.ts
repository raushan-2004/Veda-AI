import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { UnauthorizedError, ConflictError } from '@/utils/errors';

export class AuthService {
  private generateToken(userId: string, role: string): string {
    return jwt.sign({ sub: userId, role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  public async login(email: string, password: string) {
    // Standard mock check for development
    if (email === 'admin@veda.ai' && password === 'admin123') {
      const token = this.generateToken('user_admin_id', 'educator');
      return {
        token,
        user: {
          id: 'user_admin_id',
          username: 'Admin Educator',
          email: 'admin@veda.ai',
          role: 'educator',
        },
      };
    }

    if (email === 'raushan@veda.ai') {
      const token = this.generateToken('user_raushan_id', 'educator');
      return {
        token,
        user: {
          id: 'user_raushan_id',
          username: 'Raushan Kumar',
          email: 'raushan@veda.ai',
          role: 'educator',
        },
      };
    }

    throw new UnauthorizedError('Invalid email or password combination');
  }

  public async signup(username: string, email: string, role: string) {
    if (email === 'raushan@veda.ai' || email === 'admin@veda.ai') {
      throw new ConflictError('A user account with this email address already exists');
    }

    const mockId = `user_${Math.random().toString(36).substring(7)}`;
    const token = this.generateToken(mockId, role);

    return {
      token,
      user: {
        id: mockId,
        username,
        email,
        role,
      },
    };
  }
}

export const authService = new AuthService();
export default authService;
