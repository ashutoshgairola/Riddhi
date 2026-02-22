import { Router } from 'express';

import { AuthMiddleware } from '../middleware/auth';
import { InvestmentController } from './controller';

export class InvestmentRoutes {
  private router: Router;
  private controller: InvestmentController;
  private authMiddleware: AuthMiddleware;

  constructor(controller: InvestmentController, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.controller = controller;
    this.authMiddleware = authMiddleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // All routes require authentication
    this.router.use(this.authMiddleware.authenticate);

    // Portfolio analytics — register BEFORE /:id to avoid Express treating
    // "portfolio" as an :id param
    this.router.get('/portfolio/summary', this.controller.getPortfolioSummary);
    this.router.get('/portfolio/allocation', this.controller.getPortfolioAllocation);
    this.router.get('/portfolio/performance', this.controller.getPortfolioPerformance);

    // Core CRUD
    this.router.get('/', this.controller.getInvestments);
    this.router.post('/', this.controller.createInvestment);
    this.router.get('/:id', this.controller.getInvestmentById);
    this.router.put('/:id', this.controller.updateInvestment);
    this.router.delete('/:id', this.controller.deleteInvestment);

    // Per-holding sub-resources
    this.router.get('/:id/transactions', this.controller.getInvestmentTransactions);
    this.router.post('/:id/transactions', this.controller.createInvestmentTransaction);
    this.router.delete('/:id/transactions/:txId', this.controller.deleteInvestmentTransaction);
    this.router.get('/:id/returns', this.controller.getInvestmentReturns);
  }

  getRouter(): Router {
    return this.router;
  }
}
