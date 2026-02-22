// backend/src/dashboard/routes.ts
import { Router } from 'express';

import { AuthMiddleware } from '../middleware/auth';
import { DashboardController } from './controller';

export class DashboardRoutes {
  private router: Router;
  private controller: DashboardController;
  private authMiddleware: AuthMiddleware;

  constructor(controller: DashboardController, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.controller = controller;
    this.authMiddleware = authMiddleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.use(this.authMiddleware.authenticate);

    /**
     * @route   GET /api/dashboard
     * @desc    Get all dashboard data in a single request
     * @access  Private
     */
    this.router.get('/', this.controller.getDashboardData);
  }

  getRouter(): Router {
    return this.router;
  }
}
