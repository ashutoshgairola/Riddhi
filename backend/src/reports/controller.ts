import { Request, Response } from 'express';

import { getErrorMessage, sendResponse } from '../common/utils';
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

  getAccountSummary = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'getAccountSummary' });
    try {
      const { userId } = req.body.user;
      delete req.body.user;

      const query: AccountSummaryQuery = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      requestLogger.info({ userId, ...query }, 'Getting account summary');
      const data = await this.reportService.getAccountSummary(userId, query);
      sendResponse({ res, data, message: 'Account summary fetched successfully' });
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error fetching account summary');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  };

  getIncomeExpenseSummary = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'getIncomeExpenseSummary' });
    try {
      const { userId } = req.body.user;
      delete req.body.user;

      const query: IncomeExpenseQuery = {
        period: (req.query.period as Timeframe) || 'month',
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      requestLogger.info({ userId, period: query.period }, 'Getting income/expense summary');
      const data = await this.reportService.getIncomeExpenseSummary(userId, query);
      sendResponse({ res, data, message: 'Income/expense summary fetched successfully' });
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error fetching income/expense summary');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  };

  getCategoryReport = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'getCategoryReport' });
    try {
      const { userId } = req.body.user;
      delete req.body.user;

      const categoryId = req.query.categoryId as string;
      if (!categoryId) {
        res.status(400).json({ error: 'categoryId is required' });
        return;
      }

      const query: CategoryReportQuery = {
        categoryId,
        period: (req.query.period as Timeframe) || 'month',
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      requestLogger.info({ userId, categoryId }, 'Getting category report');
      const data = await this.reportService.getCategoryReport(userId, query);
      sendResponse({ res, data, message: 'Category report fetched successfully' });
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg === 'Category not found') {
        res.status(404).json({ error: msg });
      } else {
        this.logger.error({ error }, 'Error fetching category report');
        res.status(500).json({ error: msg });
      }
    }
  };

  getBudgetPerformance = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'getBudgetPerformance' });
    try {
      const { userId } = req.body.user;
      delete req.body.user;

      const query: BudgetPerformanceQuery = {
        budgetId: req.query.budgetId as string | undefined,
      };

      requestLogger.info({ userId, budgetId: query.budgetId }, 'Getting budget performance');
      const data = await this.reportService.getBudgetPerformance(userId, query);
      sendResponse({ res, data, message: 'Budget performance fetched successfully' });
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg === 'Budget not found' || msg === 'No current budget found') {
        res.status(404).json({ error: msg });
      } else {
        this.logger.error({ error }, 'Error fetching budget performance');
        res.status(500).json({ error: msg });
      }
    }
  };

  getNetWorthOverTime = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'getNetWorthOverTime' });
    try {
      const { userId } = req.body.user;
      delete req.body.user;

      const query: NetWorthQuery = {
        period: (req.query.period as NetWorthPeriod) || 'month',
      };

      requestLogger.info({ userId, period: query.period }, 'Getting net worth over time');
      const data = await this.reportService.getNetWorthOverTime(userId, query);
      sendResponse({ res, data, message: 'Net worth data fetched successfully' });
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error fetching net worth');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  };

  getCustomReport = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'getCustomReport' });
    try {
      const { userId } = req.body.user;
      delete req.body.user;

      const reportRequest: CustomReportRequest = req.body;

      if (!reportRequest.type || !reportRequest.timeframe) {
        res.status(400).json({ error: 'Report type and timeframe are required' });
        return;
      }

      if (
        reportRequest.timeframe === 'custom' &&
        (!reportRequest.startDate || !reportRequest.endDate)
      ) {
        res
          .status(400)
          .json({ error: 'Start date and end date are required for custom timeframe' });
        return;
      }

      requestLogger.info({ userId, type: reportRequest.type }, 'Generating custom report');
      const data = await this.reportService.getCustomReport(userId, reportRequest);
      sendResponse({ res, data, message: 'Custom report generated successfully' });
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('not found')) {
        res.status(404).json({ error: msg });
      } else if (msg.includes('required')) {
        res.status(400).json({ error: msg });
      } else {
        this.logger.error({ error }, 'Error generating custom report');
        res.status(500).json({ error: msg });
      }
    }
  };
}
