import { Router } from 'express';

import { AuthMiddleware } from '../middleware/auth';
import { GoalController } from './controller';

export class GoalRoutes {
  private router: Router;
  private controller: GoalController;
  private authMiddleware: AuthMiddleware;

  constructor(controller: GoalController, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.controller = controller;
    this.authMiddleware = authMiddleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // All routes require authentication
    this.router.use(this.authMiddleware.authenticate);

    // Goal routes
    this.router.get('/', this.controller.getGoals);
    this.router.get('/:id', this.controller.getGoalById);
    this.router.post('/', this.controller.createGoal);
    this.router.put('/:id', this.controller.updateGoal);
    this.router.delete('/:id', this.controller.deleteGoal);

    // Goal status routes
    this.router.post('/:id/complete', this.controller.completeGoal);
    this.router.post('/:id/pause', this.controller.pauseGoal);
    this.router.post('/:id/resume', this.controller.resumeGoal);
  }

  getRouter(): Router {
    return this.router;
  }
}
