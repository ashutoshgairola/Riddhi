import { Request, Response } from 'express';

import { getErrorMessage, sendResponse } from '../common/utils';
import { createChildLogger } from '../config/logger';
import { InvestmentService } from './service';
import {
  CreateInvestmentRequest,
  CreateInvestmentTxRequest,
  GetInvestmentsQuery,
  GetPortfolioPerformanceQuery,
  UpdateInvestmentRequest,
} from './types/interface';

export class InvestmentController {
  private investmentService: InvestmentService;
  private logger = createChildLogger({ controller: 'InvestmentController' });

  constructor(investmentService: InvestmentService) {
    this.investmentService = investmentService;
  }

  // ── Core CRUD ─────────────────────────────────────────────────────────────────

  getInvestments = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'getInvestments' });
    let userId!: string;

    try {
      userId = req.body.user.userId;
      delete req.body.user;

      const raw = req.query as Record<string, string | undefined>;
      const query: GetInvestmentsQuery = {
        assetClass: raw.assetClass,
        type: raw.type,
        accountId: raw.accountId,
        searchTerm: raw.searchTerm,
        sort: raw.sort,
        order: raw.order as GetInvestmentsQuery['order'],
        page: raw.page !== undefined ? parseInt(raw.page, 10) : undefined,
        limit: raw.limit !== undefined ? parseInt(raw.limit, 10) : undefined,
      };

      requestLogger.info({ userId, query }, 'Get investments request');

      const result = await this.investmentService.getInvestments(userId, query);

      sendResponse({ res, data: result, message: 'Investments fetched successfully' });
    } catch (error: unknown) {
      requestLogger.error({ error, userId }, 'Error fetching investments');
      res.status(500).json({ error: 'Failed to fetch investments' });
    }
  };

  getInvestmentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const { id } = req.params;

      const investment = await this.investmentService.getInvestmentById(id, userId);

      sendResponse({ res, data: investment, message: 'Investment fetched successfully' });
    } catch (error: unknown) {
      if (getErrorMessage(error) === 'Investment not found') {
        res.status(404).json({ error: getErrorMessage(error) });
      } else {
        this.logger.error({ error }, 'Error fetching investment');
        res.status(500).json({ error: 'Failed to fetch investment' });
      }
    }
  };

  createInvestment = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'createInvestment' });
    let userId!: string;

    try {
      userId = req.body.user.userId;
      delete req.body.user;
      const data: CreateInvestmentRequest = req.body;

      requestLogger.info({ userId, name: data.name, type: data.type }, 'Creating investment');

      // Validate required fields
      const missing: string[] = [];
      if (!data.name) missing.push('name');
      if (!data.assetClass) missing.push('assetClass');
      if (!data.type) missing.push('type');
      if (data.shares === undefined) missing.push('shares');
      if (data.purchasePrice === undefined) missing.push('purchasePrice');
      if (data.currentPrice === undefined) missing.push('currentPrice');
      if (!data.purchaseDate) missing.push('purchaseDate');
      if (!data.accountId) missing.push('accountId');
      if (!data.currency) missing.push('currency');

      if (missing.length > 0) {
        res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        return;
      }

      const investment = await this.investmentService.createInvestment(userId, data);

      requestLogger.info({ userId, investmentId: investment.id }, 'Investment created');

      sendResponse({
        res,
        data: investment,
        message: 'Investment created successfully',
        status: 201,
      });
    } catch (error: unknown) {
      requestLogger.error({ error, userId }, 'Error creating investment');
      res.status(500).json({ error: 'Failed to create investment' });
    }
  };

  updateInvestment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const { id } = req.params;
      const updates: UpdateInvestmentRequest = req.body;

      const investment = await this.investmentService.updateInvestment(id, userId, updates);

      sendResponse({ res, data: investment, message: 'Investment updated successfully' });
    } catch (error: unknown) {
      if (getErrorMessage(error) === 'Investment not found') {
        res.status(404).json({ error: getErrorMessage(error) });
      } else {
        this.logger.error({ error }, 'Error updating investment');
        res.status(500).json({ error: 'Failed to update investment' });
      }
    }
  };

  deleteInvestment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const { id } = req.params;

      await this.investmentService.deleteInvestment(id, userId);

      sendResponse({ res, data: { id }, message: 'Investment deleted successfully' });
    } catch (error: unknown) {
      if (getErrorMessage(error) === 'Investment not found') {
        res.status(404).json({ error: getErrorMessage(error) });
      } else {
        this.logger.error({ error }, 'Error deleting investment');
        res.status(500).json({ error: 'Failed to delete investment' });
      }
    }
  };

  // ── Portfolio Analytics ───────────────────────────────────────────────────────

  getPortfolioSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const summary = await this.investmentService.getPortfolioSummary(userId);

      sendResponse({ res, data: summary, message: 'Portfolio summary fetched successfully' });
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error fetching portfolio summary');
      res.status(500).json({ error: 'Failed to fetch portfolio summary' });
    }
  };

  getPortfolioAllocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const allocation = await this.investmentService.getPortfolioAllocation(userId);

      sendResponse({ res, data: allocation, message: 'Asset allocation fetched successfully' });
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error fetching asset allocation');
      res.status(500).json({ error: 'Failed to fetch asset allocation' });
    }
  };

  getPortfolioPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const raw = req.query as Record<string, string | undefined>;
      const query: GetPortfolioPerformanceQuery = { from: raw.from, to: raw.to };

      const performance = await this.investmentService.getPortfolioPerformance(userId, query);

      sendResponse({
        res,
        data: performance,
        message: 'Portfolio performance fetched successfully',
      });
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error fetching portfolio performance');
      res.status(500).json({ error: 'Failed to fetch portfolio performance' });
    }
  };

  // ── Per-Holding Transactions ──────────────────────────────────────────────────

  getInvestmentTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const { id } = req.params;

      const result = await this.investmentService.getInvestmentTransactions(id, userId);

      sendResponse({
        res,
        data: result,
        message: 'Investment transactions fetched successfully',
      });
    } catch (error: unknown) {
      if (getErrorMessage(error) === 'Investment not found') {
        res.status(404).json({ error: getErrorMessage(error) });
      } else {
        this.logger.error({ error }, 'Error fetching investment transactions');
        res.status(500).json({ error: 'Failed to fetch investment transactions' });
      }
    }
  };

  createInvestmentTransaction = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'createInvestmentTransaction' });
    let userId!: string;

    try {
      userId = req.body.user.userId;
      delete req.body.user;
      const { id } = req.params;
      const data: CreateInvestmentTxRequest = req.body;

      requestLogger.info({ userId, investmentId: id, type: data.type }, 'Recording transaction');

      if (!data.type || !data.date) {
        res.status(400).json({ error: 'Missing required fields: type, date' });
        return;
      }

      const tx = await this.investmentService.createInvestmentTransaction(id, userId, data);

      requestLogger.info({ userId, txId: tx.id }, 'Transaction recorded');

      sendResponse({
        res,
        data: tx,
        message: 'Investment transaction recorded successfully',
        status: 201,
      });
    } catch (error: unknown) {
      if (getErrorMessage(error) === 'Investment not found') {
        res.status(404).json({ error: getErrorMessage(error) });
      } else if (
        getErrorMessage(error).includes('Missing required fields') ||
        getErrorMessage(error) === 'Insufficient shares to sell'
      ) {
        res.status(400).json({ error: getErrorMessage(error) });
      } else {
        requestLogger.error({ error, userId }, 'Error recording investment transaction');
        res.status(500).json({ error: 'Failed to record investment transaction' });
      }
    }
  };

  deleteInvestmentTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const { id, txId } = req.params;

      await this.investmentService.deleteInvestmentTransaction(id, txId, userId);

      sendResponse({
        res,
        data: { id: txId },
        message: 'Investment transaction deleted successfully',
      });
    } catch (error: unknown) {
      if (getErrorMessage(error) === 'Investment not found') {
        res.status(404).json({ error: getErrorMessage(error) });
      } else if (getErrorMessage(error) === 'Investment transaction not found') {
        res.status(404).json({ error: getErrorMessage(error) });
      } else {
        this.logger.error({ error }, 'Error deleting investment transaction');
        res.status(500).json({ error: 'Failed to delete investment transaction' });
      }
    }
  };

  // ── Returns ───────────────────────────────────────────────────────────────────

  getInvestmentReturns = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const { id } = req.params;

      const returns = await this.investmentService.getInvestmentReturns(id, userId);

      sendResponse({
        res,
        data: returns,
        message: 'Investment returns fetched successfully',
      });
    } catch (error: unknown) {
      if (getErrorMessage(error) === 'Investment not found') {
        res.status(404).json({ error: getErrorMessage(error) });
      } else {
        this.logger.error({ error }, 'Error fetching investment returns');
        res.status(500).json({ error: 'Failed to fetch investment returns' });
      }
    }
  };
}
