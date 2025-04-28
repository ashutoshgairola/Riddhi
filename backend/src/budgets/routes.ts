import { Router } from 'express';

import { AuthMiddleware } from '../middleware/auth';
import { BudgetController } from './controller';

export class BudgetRoutes {
  private router: Router;
  private controller: BudgetController;
  private authMiddleware: AuthMiddleware;

  constructor(controller: BudgetController, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.controller = controller;
    this.authMiddleware = authMiddleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // All routes require authentication
    this.router.use(this.authMiddleware.authenticate);

    // Budget routes
    this.router.get('/current', this.controller.getCurrentBudget);
    this.router.get('/', this.controller.getBudgets);
    this.router.get('/:id', this.controller.getBudgetById);
    this.router.post('/', this.controller.createBudget);
    this.router.put('/:id', this.controller.updateBudget);
    this.router.delete('/:id', this.controller.deleteBudget);

    // Budget category routes
    this.router.post('/:id/categories', this.controller.createBudgetCategory);
    this.router.put('/:budgetId/categories/:categoryId', this.controller.updateBudgetCategory);
    this.router.delete('/:budgetId/categories/:categoryId', this.controller.deleteBudgetCategory);
  }

  getRouter(): Router {
    return this.router;
  }
}
