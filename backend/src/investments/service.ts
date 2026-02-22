import dayjs from 'dayjs';
import { Db } from 'mongodb';

import { InvestmentModel } from './db';
import { InvestmentTransactionModel } from './transaction-db';
import {
  AssetAllocationDTO,
  AssetClass,
  CreateInvestmentRequest,
  CreateInvestmentTxRequest,
  GetInvestmentsQuery,
  GetPortfolioPerformanceQuery,
  Investment,
  InvestmentDTO,
  InvestmentReturnsDTO,
  InvestmentTransaction,
  InvestmentTransactionDTO,
  InvestmentTransactionsResponse,
  InvestmentsResponse,
  PortfolioPerformancePointDTO,
  PortfolioSummaryDTO,
  UpdateInvestmentRequest,
} from './types/interface';

const ASSET_CLASS_COLORS: Record<AssetClass, string> = {
  stocks: '#4CAF50',
  bonds: '#2196F3',
  real_estate: '#FFC107',
  cash: '#9E9E9E',
  alternatives: '#9C27B0',
  other: '#607D8B',
};

export class InvestmentService {
  private investmentModel: InvestmentModel;
  private txModel: InvestmentTransactionModel;

  constructor(db: Db) {
    this.investmentModel = new InvestmentModel(db);
    this.txModel = new InvestmentTransactionModel(db);
  }

  async initialize(): Promise<void> {
    await this.investmentModel.initialize();
    await this.txModel.initialize();
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────────

  async getInvestments(userId: string, query: GetInvestmentsQuery): Promise<InvestmentsResponse> {
    const result = await this.investmentModel.findAll(userId, query);

    return {
      items: result.items.map((inv) => this.toDTO(inv)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    };
  }

  async getInvestmentById(id: string, userId: string): Promise<InvestmentDTO> {
    const investment = await this.investmentModel.findById(id, userId);
    if (!investment) {
      throw new Error('Investment not found');
    }

    return this.toDTO(investment);
  }

  async createInvestment(userId: string, data: CreateInvestmentRequest): Promise<InvestmentDTO> {
    const investment = await this.investmentModel.create({
      userId,
      name: data.name,
      ticker: data.ticker,
      assetClass: data.assetClass,
      type: data.type,
      shares: data.shares,
      purchasePrice: data.purchasePrice,
      currentPrice: data.currentPrice,
      purchaseDate: data.purchaseDate,
      accountId: data.accountId,
      notes: data.notes,
      dividendYield: data.dividendYield,
      sector: data.sector,
      region: data.region,
      currency: data.currency,
    });

    return this.toDTO(investment);
  }

  async updateInvestment(
    id: string,
    userId: string,
    updates: UpdateInvestmentRequest,
  ): Promise<InvestmentDTO> {
    const investment = await this.investmentModel.findById(id, userId);
    if (!investment) {
      throw new Error('Investment not found');
    }

    const allowedFields: (keyof UpdateInvestmentRequest)[] = [
      'name',
      'ticker',
      'assetClass',
      'type',
      'shares',
      'purchasePrice',
      'currentPrice',
      'purchaseDate',
      'accountId',
      'notes',
      'dividendYield',
      'sector',
      'region',
      'currency',
    ];

    const cleanUpdates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        cleanUpdates[field] = updates[field];
      }
    }

    if (Object.keys(cleanUpdates).length === 0) {
      return this.toDTO(investment);
    }

    const updated = await this.investmentModel.update(id, userId, cleanUpdates);
    if (!updated) {
      throw new Error('Failed to update investment');
    }

    return this.toDTO(updated);
  }

  async deleteInvestment(id: string, userId: string): Promise<void> {
    const investment = await this.investmentModel.findById(id, userId);
    if (!investment) {
      throw new Error('Investment not found');
    }

    // Delete all associated transactions first
    await this.txModel.deleteByInvestmentId(id, userId);

    const deleted = await this.investmentModel.delete(id, userId);
    if (!deleted) {
      throw new Error('Failed to delete investment');
    }
  }

  // ── Transactions ──────────────────────────────────────────────────────────────

  async getInvestmentTransactions(
    investmentId: string,
    userId: string,
  ): Promise<InvestmentTransactionsResponse> {
    const investment = await this.investmentModel.findById(investmentId, userId);
    if (!investment) {
      throw new Error('Investment not found');
    }

    const txs = await this.txModel.findByInvestmentId(investmentId, userId);

    return {
      items: txs.map((tx) => this.toTxDTO(tx)),
      total: txs.length,
    };
  }

  async createInvestmentTransaction(
    investmentId: string,
    userId: string,
    data: CreateInvestmentTxRequest,
  ): Promise<InvestmentTransactionDTO> {
    const investment = await this.investmentModel.findById(investmentId, userId);
    if (!investment) {
      throw new Error('Investment not found');
    }

    let amount: number;
    let shares: number | undefined = data.shares;
    let price: number | undefined = data.price;

    if (data.type === 'dividend') {
      if (data.amount === undefined) {
        throw new Error('Missing required fields: type, date, amount');
      }
      amount = data.amount;
      shares = undefined;
      price = undefined;
    } else {
      // buy or sell
      if (!shares || !price) {
        throw new Error('Missing required fields: type, date, shares, price');
      }
      amount = shares * price;

      if (data.type === 'sell' && shares > investment.shares) {
        throw new Error('Insufficient shares to sell');
      }
    }

    // Record the transaction
    const tx = await this.txModel.create({
      investmentId,
      userId,
      type: data.type,
      shares,
      price,
      amount,
      date: data.date,
      notes: data.notes,
    });

    // Update parent investment shares and cost basis
    if (data.type === 'buy') {
      // Weighted average cost basis: (oldShares * oldPrice + newShares * newPrice) / totalShares
      const oldTotal = investment.shares * investment.purchasePrice;
      const newTotal = (shares as number) * (price as number);
      const totalShares = investment.shares + (shares as number);
      const newAvgPrice = totalShares > 0 ? (oldTotal + newTotal) / totalShares : 0;

      await this.investmentModel.update(investmentId, userId, {
        shares: totalShares,
        purchasePrice: Math.round(newAvgPrice * 100) / 100,
      });
    } else if (data.type === 'sell') {
      const remainingShares = investment.shares - (shares as number);

      await this.investmentModel.update(investmentId, userId, {
        shares: remainingShares,
        // purchasePrice (avg cost basis) stays the same on sell
      });
    }
    // Dividend: no change to investment shares/price

    return this.toTxDTO(tx);
  }

  async deleteInvestmentTransaction(
    investmentId: string,
    txId: string,
    userId: string,
  ): Promise<void> {
    const investment = await this.investmentModel.findById(investmentId, userId);
    if (!investment) {
      throw new Error('Investment not found');
    }

    const tx = await this.txModel.findById(txId, userId);
    if (!tx || tx.investmentId.toString() !== investmentId) {
      throw new Error('Investment transaction not found');
    }

    // Reverse the effect on parent investment
    if (tx.type === 'buy' && tx.shares) {
      // Undo the buy: remove shares, recalculate cost basis
      const remainingShares = investment.shares - tx.shares;
      let newAvgPrice = investment.purchasePrice;

      if (remainingShares > 0) {
        // Reverse weighted average: (totalCost - removedCost) / remainingShares
        const totalCost = investment.shares * investment.purchasePrice;
        const removedCost = tx.shares * (tx.price || investment.purchasePrice);
        newAvgPrice = Math.round(((totalCost - removedCost) / remainingShares) * 100) / 100;
      }

      await this.investmentModel.update(investmentId, userId, {
        shares: Math.max(0, remainingShares),
        purchasePrice: remainingShares > 0 ? newAvgPrice : 0,
      });
    } else if (tx.type === 'sell' && tx.shares) {
      // Undo the sell: add shares back
      await this.investmentModel.update(investmentId, userId, {
        shares: investment.shares + tx.shares,
      });
    }
    // Dividend delete: no change to investment shares/price

    const deleted = await this.txModel.delete(txId, userId);
    if (!deleted) {
      throw new Error('Failed to delete investment transaction');
    }
  }

  // ── Returns ───────────────────────────────────────────────────────────────────

  async getInvestmentReturns(id: string, userId: string): Promise<InvestmentReturnsDTO> {
    const investment = await this.investmentModel.findById(id, userId);
    if (!investment) {
      throw new Error('Investment not found');
    }

    const currentValue = investment.shares * investment.currentPrice;
    const totalInvested = investment.shares * investment.purchasePrice;
    const unrealisedGainLoss = currentValue - totalInvested;
    const unrealisedReturnPercent =
      totalInvested > 0 ? Math.round((unrealisedGainLoss / totalInvested) * 10000) / 100 : 0;

    const investmentId = investment._id?.toString() ?? '';

    // Realised gain/loss from sell transactions
    const realisedGainLoss = await this.txModel.computeRealisedGainLoss(
      investmentId,
      userId,
      investment.purchasePrice,
    );

    // Total dividend income
    const dividendIncome = await this.txModel.sumByType(investmentId, userId, 'dividend');

    const totalReturn = unrealisedGainLoss + realisedGainLoss + dividendIncome;
    const totalReturnPercent =
      totalInvested > 0 ? Math.round((totalReturn / totalInvested) * 10000) / 100 : 0;

    return {
      investmentId,
      totalInvested: Math.round(totalInvested * 100) / 100,
      currentValue: Math.round(currentValue * 100) / 100,
      unrealisedGainLoss: Math.round(unrealisedGainLoss * 100) / 100,
      unrealisedReturnPercent,
      realisedGainLoss: Math.round(realisedGainLoss * 100) / 100,
      dividendIncome: Math.round(dividendIncome * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      totalReturnPercent,
    };
  }

  // ── Portfolio Aggregations ────────────────────────────────────────────────────

  async getPortfolioSummary(userId: string): Promise<PortfolioSummaryDTO> {
    const investments = await this.investmentModel.findAllByUserId(userId);

    let totalValue = 0;
    let totalInvested = 0;

    for (const inv of investments) {
      totalValue += inv.shares * inv.currentPrice;
      totalInvested += inv.shares * inv.purchasePrice;
    }

    const totalGainLoss = totalValue - totalInvested;
    const totalReturnPercent =
      totalInvested > 0 ? Math.round((totalGainLoss / totalInvested) * 10000) / 100 : 0;

    // Day change and period returns require historical price data.
    // For now, return 0 — these can be populated once a price history
    // collection or external API integration is in place.
    return {
      totalValue: Math.round(totalValue * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalGainLoss: Math.round(totalGainLoss * 100) / 100,
      totalReturnPercent,
      dayChange: 0,
      dayChangePercent: 0,
      thirtyDayReturnPercent: 0,
      ytdReturnPercent: 0,
      numberOfHoldings: investments.length,
    };
  }

  async getPortfolioAllocation(userId: string): Promise<{ allocations: AssetAllocationDTO[] }> {
    const investments = await this.investmentModel.findAllByUserId(userId);

    const buckets: Record<string, number> = {};
    let totalValue = 0;

    for (const inv of investments) {
      const value = inv.shares * inv.currentPrice;
      buckets[inv.assetClass] = (buckets[inv.assetClass] || 0) + value;
      totalValue += value;
    }

    const allocations: AssetAllocationDTO[] = Object.entries(buckets)
      .map(([assetClass, amount]) => ({
        assetClass: assetClass as AssetClass,
        percentage: totalValue > 0 ? Math.round((amount / totalValue) * 10000) / 100 : 0,
        amount: Math.round(amount * 100) / 100,
        color: ASSET_CLASS_COLORS[assetClass as AssetClass] || ASSET_CLASS_COLORS.other,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Normalize percentages to sum to exactly 100 if there are allocations
    if (allocations.length > 0) {
      const sum = allocations.reduce((s, a) => s + a.percentage, 0);
      if (sum !== 100 && sum > 0) {
        // Adjust the largest bucket to absorb rounding error
        allocations[0].percentage += Math.round((100 - sum) * 100) / 100;
      }
    }

    return { allocations };
  }

  async getPortfolioPerformance(
    userId: string,
    query: GetPortfolioPerformanceQuery,
  ): Promise<{ performance: PortfolioPerformancePointDTO[] }> {
    const now = dayjs();
    const from = query.from
      ? dayjs(query.from + '-01')
      : now.subtract(12, 'month').startOf('month');
    const to = query.to ? dayjs(query.to + '-01').endOf('month') : now.endOf('month');

    const investments = await this.investmentModel.findAllByUserId(userId);

    // Build monthly snapshots.
    // Without a historical price collection, we use a simplified approach:
    // for each month, sum (shares × currentPrice) for investments that existed
    // by that month (based on purchaseDate). This gives a reasonable approximation
    // but will be replaced once price history is available.
    const performance: PortfolioPerformancePointDTO[] = [];
    let cursor = from.startOf('month');

    while (cursor.isBefore(to) || cursor.isSame(to, 'month')) {
      const monthEnd = cursor.endOf('month');
      let monthValue = 0;

      for (const inv of investments) {
        const purchaseDate = dayjs(inv.purchaseDate);
        if (purchaseDate.isBefore(monthEnd) || purchaseDate.isSame(monthEnd, 'day')) {
          monthValue += inv.shares * inv.currentPrice;
        }
      }

      performance.push({
        date: cursor.format('YYYY-MM'),
        value: Math.round(monthValue * 100) / 100,
      });

      cursor = cursor.add(1, 'month');
    }

    return { performance };
  }

  // ── Mapping ───────────────────────────────────────────────────────────────────

  private toDTO(inv: Investment): InvestmentDTO {
    const currentValue = inv.shares * inv.currentPrice;
    const totalInvested = inv.shares * inv.purchasePrice;
    const gainLoss = currentValue - totalInvested;
    const returnPercent =
      totalInvested > 0 ? Math.round((gainLoss / totalInvested) * 10000) / 100 : 0;

    return {
      id: inv._id?.toString() ?? '',
      name: inv.name,
      ticker: inv.ticker,
      assetClass: inv.assetClass,
      type: inv.type,
      shares: inv.shares,
      purchasePrice: inv.purchasePrice,
      currentPrice: inv.currentPrice,
      purchaseDate: inv.purchaseDate,
      accountId: inv.accountId,
      notes: inv.notes,
      dividendYield: inv.dividendYield,
      sector: inv.sector,
      region: inv.region,
      currency: inv.currency,
      currentValue: Math.round(currentValue * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      gainLoss: Math.round(gainLoss * 100) / 100,
      returnPercent,
    };
  }

  private toTxDTO(tx: InvestmentTransaction): InvestmentTransactionDTO {
    return {
      id: tx._id?.toString() ?? '',
      investmentId: tx.investmentId.toString(),
      type: tx.type,
      shares: tx.shares ?? null,
      price: tx.price ?? null,
      amount: tx.amount,
      date: tx.date,
      notes: tx.notes ?? null,
    };
  }
}
