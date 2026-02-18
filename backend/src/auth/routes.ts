import { Router } from 'express';

import { AuthMiddleware } from '../middleware/auth';
import { AuthController } from './controller';

export class AuthRoutes {
  private router: Router;
  private controller: AuthController;
  private middleware: AuthMiddleware;

  constructor(controller: AuthController, middleware: AuthMiddleware) {
    this.router = Router();
    this.controller = controller;
    this.middleware = middleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Public routes
    this.router.post('/register', this.controller.register);
    this.router.post('/login', this.controller.login);
    this.router.post('/reset-password/request', this.controller.resetPasswordRequest);
    this.router.post('/reset-password/confirm', this.controller.resetPasswordConfirm);

    // Protected routes
    this.router.use(this.middleware.authenticate);

    this.router.get('/profile', this.controller.getProfile);
    this.router.put('/profile', this.controller.updateProfile);
    this.router.put('/change-password', this.controller.changePassword);
  }

  getRouter(): Router {
    return this.router;
  }
}
