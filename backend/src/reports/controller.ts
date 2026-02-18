import { Request, Response } from 'express';

import { createChildLogger } from '../config/logger';
import { ReportService } from './service';
import {
  AccountSummaryQuery,
  BudgetPerformanceQuery,
  CategoryReportQuery,
  CustomReportRequest,
  IncomeExpenseQuery,
  NetWorthPeriod,
  NetWorthQuery,
  Timeframe,
} from './types/interface';

export class ReportController {
  private reportService: ReportService;
  private logger = createChildLogger({ controller: 'ReportController' });

  constructor(reportService: ReportService) {
    this.reportService = reportService;
  }

  /**
   * Get account summary
   */
  async getAccountSummary(req: Request, res: Response): Promise<void> {
    const requestLogger = this.logger.child({ method: 'getAccountSummary' });

    try {
      const { userId } = req.body.user;
      const query: AccountSummaryQuery = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      requestLogger.info(
        { userId, startDate: query.startDate, endDate: query.endDate },
        'Getting account summary',
      );

      const accountSummary = await this.reportService.getAccountSummary(userId, query);

      requestLogger.info({ userId }, 'Account summary fetched successfully');

      res.status(200).json(accountSummary);
    } catch (error: any) {
      requestLogger.error(
        { error, userId: req.body.user?.userId },
        'Error fetching account summary',
      );
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get income expense summary
   */
  async getIncomeExpenseSummary(req: Request, res: Response): Promise<void> {
    const requestLogger = this.logger.child({ method: 'getIncomeExpenseSummary' });

    try {
      const { userId } = req.body.user;
      const query: IncomeExpenseQuery = {
        period: (req.query.period as Timeframe) || 'month',
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      requestLogger.info({ userId, period: query.period }, 'Getting income expense summary');

      const incomeExpenseSummary = await this.reportService.getIncomeExpenseSummary(userId, query);

      requestLogger.info({ userId }, 'Income expense summary fetched successfully');

      res.status(200).json(incomeExpenseSummary);
    } catch (error: any) {
      requestLogger.error(
        { error, userId: req.body.user?.userId },
        'Error fetching income expense summary',
      );
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get category report
   */
  async getCategoryReport(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body.user;
      const categoryId = req.query.categoryId as string;

      if (!categoryId) {
        res.status(400).json({ message: 'Category ID is required' });
        return;
      }

      const query: CategoryReportQuery = {
        categoryId,
        period: (req.query.period as Timeframe) || 'month',
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const categoryReport = await this.reportService.getCategoryReport(userId, query);
      res.status(200).json(categoryReport);
    } catch (error: any) {
      if (error.message === 'Category not found') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  /**
   * Get budget performance report
   */
  async getBudgetPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body.user;
      const query: BudgetPerformanceQuery = {
        budgetId: req.query.budgetId as string,
      };

      const budgetPerformance = await this.reportService.getBudgetPerformance(userId, query);
      res.status(200).json(budgetPerformance);
    } catch (error: any) {
      if (error.message === 'Budget not found' || error.message === 'No current budget found') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  /**
   * Get net worth over time
   */
  async getNetWorthOverTime(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body.user;
      const query: NetWorthQuery = {
        period: (req.query.period as NetWorthPeriod) || 'month',
      };

      const netWorthData = await this.reportService.getNetWorthOverTime(userId, query);
      res.status(200).json(netWorthData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get custom report
   */
  async getCustomReport(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body.user;
      const reportRequest: CustomReportRequest = req.body;

      // Validation
      if (!reportRequest.type || !reportRequest.timeframe) {
        res.status(400).json({ message: 'Report type and timeframe are required' });
        return;
      }

      if (
        reportRequest.timeframe === 'custom' &&
        (!reportRequest.startDate || !reportRequest.endDate)
      ) {
        res.status(400).json({
          message: 'Start date and end date are required for custom timeframe',
        });
        return;
      }

      const customReport = await this.reportService.getCustomReport(userId, reportRequest);
      res.status(200).json(customReport);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else if (error.message.includes('required')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }
}
