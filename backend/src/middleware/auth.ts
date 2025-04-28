import { NextFunction, Request, Response } from 'express';

import { AuthService } from '../auth/service';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized - No token provided' });
        return;
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json({ error: 'Unauthorized - Invalid token format' });
        return;
      }

      try {
        const decoded = this.authService.verifyToken(token);
        req.body.user = {
          userId: decoded.userId,
          email: decoded.email,
        };
        next();
      } catch (error) {
        res.status(401).json({ error: 'Unauthorized - Invalid or expired token' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
