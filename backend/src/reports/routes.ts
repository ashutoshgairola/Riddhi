import { Router } from 'express';

import { AuthMiddleware } from '../middleware/auth';
import { ReportController } from './controller';

export class ReportRoutes {
  private router: Router;
  private controller: ReportController;
  private authMiddleware: AuthMiddleware;

  constructor(controller: ReportController, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.controller = controller;
    this.authMiddleware = authMiddleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // All routes require authentication
    this.router.use(this.authMiddleware.authenticate);

    /**
     * @route   GET /api/reports/accounts/summary
     * @desc    Get account summary report
     * @access  Private
     */
    this.router.get('/accounts/summary', this.controller.getAccountSummary.bind(this.controller));

    /**
     * @route   GET /api/reports/income-expense
     * @desc    Get income expense summary
     * @access  Private
     */
    this.router.get(
      '/income-expense',
      this.controller.getIncomeExpenseSummary.bind(this.controller),
    );

    /**
     * @route   GET /api/reports/categories
     * @desc    Get category report
     * @access  Private
     */
    this.router.get('/categories', this.controller.getCategoryReport.bind(this.controller));

    /**
     * @route   GET /api/reports/budget-performance
     * @desc    Get budget performance report
     * @access  Private
     */
    this.router.get(
      '/budget-performance',
      this.controller.getBudgetPerformance.bind(this.controller),
    );

    /**
     * @route   GET /api/reports/net-worth
     * @desc    Get net worth over time
     * @access  Private
     */
    this.router.get('/net-worth', this.controller.getNetWorthOverTime.bind(this.controller));

    /**
     * @route   POST /api/reports/custom
     * @desc    Get custom report
     * @access  Private
     */
    this.router.post('/custom', this.controller.getCustomReport.bind(this.controller));
  }

  getRouter(): Router {
    return this.router;
  }
}
