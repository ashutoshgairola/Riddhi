import { Db } from 'mongodb';

import { AccountModel } from '../accounts/db';
import { BudgetModel } from '../budgets/db';
import { CategoryModel } from '../transactions/category-db';
import { TransactionModel } from '../transactions/db';
import {
  AccountSummaryQuery,
  AccountSummaryResponse,
  BudgetPerformanceQuery,
  BudgetPerformanceResponse,
  CategoryReportQuery,
  CategoryReportResponse,
  CustomReportRequest,
  CustomReportResponse,
  IncomeExpenseQuery,
  IncomeExpenseResponse,
  NetWorthQuery,
  NetWorthResponse,
} from './types/interface';

export class ReportService {
  private transactionModel: TransactionModel;
  private budgetModel: BudgetModel;
  private accountModel: AccountModel;
  private categoryModel: CategoryModel;

  constructor(db: Db) {
    this.transactionModel = new TransactionModel(db);
    this.budgetModel = new BudgetModel(db);
    this.accountModel = new AccountModel(db);
    this.categoryModel = new CategoryModel(db);
  }

  async initialize(): Promise<void> {
    // No specific initialization needed for reports service
  }

  async getAccountSummary(
    userId: string,
    query: AccountSummaryQuery,
  ): Promise<AccountSummaryResponse> {
    // Get current accounts
    const accounts = await this.accountModel.findAll(userId);

    // Parse date range
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(endDate.getFullYear(), endDate.getMonth() - 1, endDate.getDate()); // Default to 1 month ago

    // Get historical transaction data for the period to calculate changes
    const transactions = await this.transactionModel.findByDateRange(userId, startDate, endDate);

    // Calculate assets and liabilities
    let totalAssets = 0;
    let totalLiabilities = 0;

    // For tracking changes in account balances
    const accountBalanceChanges = new Map<string, number>();

    // First, initialize account balance changes to 0
    accounts.forEach((account) => {
      accountBalanceChanges.set(account._id!.toString(), 0);
    });

    // Calculate transaction-based balance changes during the period
    transactions.forEach((transaction) => {
      if (!transaction.accountId) return;

      const accountId = transaction.accountId;
      const currentChange = accountBalanceChanges.get(accountId) || 0;

      if (transaction.type === 'income') {
        accountBalanceChanges.set(accountId, currentChange + transaction.amount);
      } else if (transaction.type === 'expense') {
        accountBalanceChanges.set(accountId, currentChange - transaction.amount);
      } else if (transaction.type === 'transfer') {
        // For transfers, we'd need to know the destination account
        // This is a simplification - in a real app, we'd track both source and destination
        accountBalanceChanges.set(accountId, currentChange - transaction.amount);
      }
    });

    // Format account data with change calculations
    const accountsData = accounts.map((account) => {
      const id = account._id!.toString();
      const changeAmount = accountBalanceChanges.get(id) || 0;

      // Categorize as asset or liability
      if (['credit', 'loan'].includes(account.type) && account.balance < 0) {
        totalLiabilities += Math.abs(account.balance);
      } else {
        totalAssets += account.balance;
      }

      // Calculate percentage change
      let changePercentage = 0;
      const previousBalance = account.balance - changeAmount;

      if (previousBalance !== 0) {
        changePercentage = (changeAmount / Math.abs(previousBalance)) * 100;
      }

      return {
        id,
        name: account.name,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
        changeAmount,
        changePercentage,
      };
    });

    // Calculate net worth
    const netWorth = totalAssets - totalLiabilities;

    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      accounts: accountsData,
    };
  }

  async getIncomeExpenseSummary(
    userId: string,
    query: IncomeExpenseQuery,
  ): Promise<IncomeExpenseResponse> {
    // Calculate date range based on period
    const { startDate, endDate } = this.calculateDateRange(
      query.period,
      query.startDate,
      query.endDate,
    );

    // Get transactions in the date range
    const transactions = await this.transactionModel.findByDateRange(userId, startDate, endDate);

    // Get categories for enriching the data
    const categories = await this.categoryModel.findAll(userId);
    const categoryMap = new Map(categories.map((category) => [category._id!.toString(), category]));

    // Initialize counters
    let totalIncome = 0;
    let totalExpenses = 0;

    // For category breakdowns
    const incomeByCategoryMap = new Map<string, number>();
    const expensesByCategoryMap = new Map<string, number>();

    // For time series data
    const timeSeriesMap = new Map<string, { income: number; expenses: number }>();

    // Process each transaction
    transactions.forEach((transaction) => {
      const amount = transaction.amount;
      const categoryId = transaction.categoryId;

      // Format date for time series based on period
      const date = this.formatDateForPeriod(transaction.date, query.period);

      // Initialize time series entry if it doesn't exist
      if (!timeSeriesMap.has(date)) {
        timeSeriesMap.set(date, { income: 0, expenses: 0 });
      }

      if (transaction.type === 'income') {
        totalIncome += amount;

        // Update category breakdown
        if (categoryId) {
          const currentAmount = incomeByCategoryMap.get(categoryId) || 0;
          incomeByCategoryMap.set(categoryId, currentAmount + amount);
        }

        // Update time series
        const entry = timeSeriesMap.get(date)!;
        entry.income += amount;
      } else if (transaction.type === 'expense') {
        totalExpenses += amount;

        // Update category breakdown
        if (categoryId) {
          const currentAmount = expensesByCategoryMap.get(categoryId) || 0;
          expensesByCategoryMap.set(categoryId, currentAmount + amount);
        }

        // Update time series
        const entry = timeSeriesMap.get(date)!;
        entry.expenses += amount;
      }
    });

    // Calculate net cash flow and savings rate
    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

    // Format category data
    const incomeByCategory = Array.from(incomeByCategoryMap.entries())
      .map(([categoryId, amount]) => {
        const category = categoryMap.get(categoryId);
        return {
          categoryId,
          categoryName: category ? category.name : 'Uncategorized',
          amount,
          percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending

    const expensesByCategory = Array.from(expensesByCategoryMap.entries())
      .map(([categoryId, amount]) => {
        const category = categoryMap.get(categoryId);
        return {
          categoryId,
          categoryName: category ? category.name : 'Uncategorized',
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending

    // Format time series data
    const timeSeriesData = Array.from(timeSeriesMap.entries())
      .map(([date, data]) => ({
        date,
        income: data.income,
        expenses: data.expenses,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date ascending

    return {
      totalIncome,
      totalExpenses,
      netCashFlow,
      savingsRate,
      incomeByCategory,
      expensesByCategory,
      timeSeriesData,
    };
  }

  async getCategoryReport(
    userId: string,
    query: CategoryReportQuery,
  ): Promise<CategoryReportResponse> {
    // Validate that the category exists
    const category = await this.categoryModel.findById(query.categoryId, userId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Calculate date range based on period
    const { startDate, endDate } = this.calculateDateRange(
      query.period,
      query.startDate,
      query.endDate,
    );

    // Get transactions for this category in the date range
    const transactions = await this.transactionModel.findByDateRangeAndCategory(
      userId,
      startDate,
      endDate,
      query.categoryId,
    );

    // Calculate previous period for comparison
    const previousPeriodStartDate = new Date(startDate.getTime());
    const previousPeriodEndDate = new Date(endDate.getTime());

    // Adjust previous period based on current period
    switch (query.period) {
      case 'week':
        previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - 7);
        previousPeriodEndDate.setDate(previousPeriodEndDate.getDate() - 7);
        break;
      case 'month':
        previousPeriodStartDate.setMonth(previousPeriodStartDate.getMonth() - 1);
        previousPeriodEndDate.setMonth(previousPeriodEndDate.getMonth() - 1);
        break;
      case 'quarter':
        previousPeriodStartDate.setMonth(previousPeriodStartDate.getMonth() - 3);
        previousPeriodEndDate.setMonth(previousPeriodEndDate.getMonth() - 3);
        break;
      case 'year':
        previousPeriodStartDate.setFullYear(previousPeriodStartDate.getFullYear() - 1);
        previousPeriodEndDate.setFullYear(previousPeriodEndDate.getFullYear() - 1);
        break;
    }

    // Get previous period transactions for comparison
    const previousTransactions = await this.transactionModel.findByDateRangeAndCategory(
      userId,
      previousPeriodStartDate,
      previousPeriodEndDate,
      query.categoryId,
    );

    // Calculate totals
    let totalSpent = 0;
    let previousTotalSpent = 0;

    // For time series data
    const timeSeriesMap = new Map<string, number>();

    // Process current period transactions
    transactions.forEach((transaction) => {
      if (transaction.type === 'expense') {
        totalSpent += transaction.amount;

        // Format date for time series
        const date = this.formatDateForPeriod(transaction.date, query.period);

        // Update time series
        const currentAmount = timeSeriesMap.get(date) || 0;
        timeSeriesMap.set(date, currentAmount + transaction.amount);
      }
    });

    // Process previous period transactions
    previousTransactions.forEach((transaction) => {
      if (transaction.type === 'expense') {
        previousTotalSpent += transaction.amount;
      }
    });

    // Calculate comparison percentage
    let previousPeriodComparison = 0;
    if (previousTotalSpent > 0) {
      previousPeriodComparison = ((totalSpent - previousTotalSpent) / previousTotalSpent) * 100;
    }

    // Calculate average per period unit
    const periodDuration = this.getPeriodDurationInDays(query.period);
    const daysInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const periodsInRange = Math.max(1, daysInPeriod / periodDuration);
    const averagePerPeriod = totalSpent / periodsInRange;

    // Format time series data
    const timeSeriesData = Array.from(timeSeriesMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Format transaction data
    const transactionData = transactions
      .filter((t) => t.type === 'expense')
      .map((t) => ({
        id: t._id!.toString(),
        date: t.date.toISOString(),
        description: t.description,
        amount: t.amount,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first

    return {
      categoryId: query.categoryId,
      categoryName: category.name,
      totalSpent,
      averagePerPeriod,
      previousPeriodComparison,
      timeSeriesData,
      transactions: transactionData,
    };
  }

  async getBudgetPerformance(
    userId: string,
    query: BudgetPerformanceQuery,
  ): Promise<BudgetPerformanceResponse> {
    // Determine which budget to use
    let budget;

    if (query.budgetId) {
      // Get specific budget
      budget = await this.budgetModel.findById(query.budgetId, userId);
      if (!budget) {
        throw new Error('Budget not found');
      }
    } else {
      // Get current budget
      budget = await this.budgetModel.findCurrent(userId);
      if (!budget) {
        throw new Error('No current budget found');
      }
    }

    // Calculate remaining and over budget amounts
    const remainingBudget = Math.max(0, budget.totalAllocated - budget.totalSpent);
    const overBudgetAmount = Math.max(0, budget.totalSpent - budget.totalAllocated);

    // Calculate days elapsed and remaining in budget period
    const now = new Date();
    const startDate = budget.startDate;
    const endDate = budget.endDate;

    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = Math.min(
      totalDays,
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const remainingDays = Math.max(0, totalDays - elapsedDays);

    // Calculate trends
    const dailyAverage = elapsedDays > 0 ? budget.totalSpent / elapsedDays : 0;
    const projectedTotal = budget.totalSpent + dailyAverage * remainingDays;
    const willExceedBudget = projectedTotal > budget.totalAllocated;

    // Process category data
    const categories = budget.categories
      .map((category) => {
        const spent = category.spent;
        const budgeted = category.allocated;
        const remaining = Math.max(0, budgeted - spent);
        const percentUsed = budgeted > 0 ? (spent / budgeted) * 100 : 0;

        // Determine status
        let status: 'under' | 'on_track' | 'over' = 'on_track';

        // Simplified status determination based on percent used vs percent of time elapsed
        const percentOfPeriodElapsed = (elapsedDays / totalDays) * 100;

        if (percentUsed > 100) {
          status = 'over';
        } else if (percentUsed < percentOfPeriodElapsed * 0.8) {
          status = 'under';
        } else if (percentUsed > percentOfPeriodElapsed * 1.2) {
          status = 'over';
        }

        return {
          categoryId: category.categoryId,
          categoryName: category.name,
          budgeted,
          spent,
          remaining,
          percentUsed,
          status,
        };
      })
      .sort((a, b) => b.percentUsed - a.percentUsed); // Sort by percent used descending

    return {
      budgetId: budget._id!.toString(),
      budgetName: budget.name,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate.toISOString(),
      totalBudgeted: budget.totalAllocated,
      totalSpent: budget.totalSpent,
      remainingBudget,
      overBudgetAmount,
      categories,
      trends: {
        dailyAverage,
        projectedTotal,
        willExceedBudget,
      },
    };
  }

  async getNetWorthOverTime(userId: string, query: NetWorthQuery): Promise<NetWorthResponse> {
    // Get all accounts that are included in net worth calculation
    const accounts = await this.accountModel.getNetWorthAccounts(userId);

    // Calculate current net worth
    let currentNetWorth = 0;
    for (const account of accounts) {
      if (['credit', 'loan'].includes(account.type) && account.balance < 0) {
        currentNetWorth -= Math.abs(account.balance);
      } else {
        currentNetWorth += account.balance;
      }
    }

    // Determine date range based on period
    const endDate = new Date();
    let startDate: Date;
    let interval: 'day' | 'week' | 'month' | 'year';

    switch (query.period) {
      case 'month':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 12, 1);
        interval = 'month';
        break;
      case 'quarter':
        startDate = new Date(endDate.getFullYear() - 2, endDate.getMonth(), 1);
        interval = 'month';
        break;
      case 'year':
        startDate = new Date(endDate.getFullYear() - 5, 0, 1);
        interval = 'month';
        break;
      case 'all':
      default:
        // For "all", go back 10 years or to the user's first transaction, whichever is earlier
        startDate = new Date(endDate.getFullYear() - 10, 0, 1);

        // Get earliest transaction date
        const oldestTransaction = await this.transactionModel.findOldest(userId);
        if (oldestTransaction && oldestTransaction.date < startDate) {
          startDate = oldestTransaction.date;
        }

        // For long time ranges, use coarser intervals
        if (endDate.getFullYear() - startDate.getFullYear() > 3) {
          interval = 'month';
        } else if (endDate.getFullYear() - startDate.getFullYear() > 1) {
          interval = 'week';
        } else {
          interval = 'day';
        }
        break;
    }

    // Generate time series data points
    const timeSeriesData = await this.generateNetWorthTimeSeries(
      userId,
      startDate,
      endDate,
      interval,
      accounts,
    );

    // Calculate change from first data point to now
    let changeAmount = 0;
    let changePercentage = 0;

    if (timeSeriesData.length >= 2) {
      const firstDataPoint = timeSeriesData[0];
      const lastDataPoint = timeSeriesData[timeSeriesData.length - 1];

      changeAmount = lastDataPoint.netWorth - firstDataPoint.netWorth;

      if (firstDataPoint.netWorth !== 0) {
        changePercentage = (changeAmount / Math.abs(firstDataPoint.netWorth)) * 100;
      }
    }

    return {
      currentNetWorth,
      changeAmount,
      changePercentage,
      timeSeriesData,
    };
  }

  async getCustomReport(
    userId: string,
    reportRequest: CustomReportRequest,
  ): Promise<CustomReportResponse> {
    // Calculate date range
    const { startDate, endDate } = this.calculateCustomDateRange(
      reportRequest.timeframe,
      reportRequest.startDate,
      reportRequest.endDate,
    );

    // Prepare filters for query
    const filters: Record<string, any> = {};

    if (reportRequest.categoryIds && reportRequest.categoryIds.length > 0) {
      filters.categoryIds = reportRequest.categoryIds;
    }

    if (reportRequest.accountIds && reportRequest.accountIds.length > 0) {
      filters.accountIds = reportRequest.accountIds;
    }

    // Fetch data based on report type
    let data: any[] = [];
    let totalAmount = 0;
    let compareAmount = 0;

    switch (reportRequest.type) {
      case 'spending':
        const expenseData = await this.generateSpendingReport(
          userId,
          startDate,
          endDate,
          reportRequest.groupBy || 'day',
          filters,
        );
        data = expenseData.data;
        totalAmount = expenseData.total;

        // Calculate comparison if requested
        if (reportRequest.compareWithPrevious) {
          const previousPeriodData = await this.getPreviousPeriodData(
            userId,
            startDate,
            endDate,
            'expense',
            filters,
          );
          compareAmount = previousPeriodData.total;
        }
        break;

      case 'income':
        const incomeData = await this.generateIncomeReport(
          userId,
          startDate,
          endDate,
          reportRequest.groupBy || 'day',
          filters,
        );
        data = incomeData.data;
        totalAmount = incomeData.total;

        // Calculate comparison if requested
        if (reportRequest.compareWithPrevious) {
          const previousPeriodData = await this.getPreviousPeriodData(
            userId,
            startDate,
            endDate,
            'income',
            filters,
          );
          compareAmount = previousPeriodData.total;
        }
        break;

      case 'net_worth':
        const accounts = await this.accountModel.getNetWorthAccounts(userId);
        data = await this.generateNetWorthTimeSeries(
          userId,
          startDate,
          endDate,
          reportRequest.groupBy === 'category' ? 'month' : reportRequest.groupBy || 'month',
          accounts,
        );
        totalAmount = data[data.length - 1]?.netWorth || 0;

        // For net worth, compare with first data point
        if (reportRequest.compareWithPrevious && data.length > 0) {
          compareAmount = data[0].netWorth;
        }
        break;

      case 'category':
        if (!filters.categoryIds || filters.categoryIds.length === 0) {
          throw new Error('At least one category ID is required for category reports');
        }

        const categoryData = await this.generateCategoryReport(
          userId,
          startDate,
          endDate,
          filters.categoryIds[0],
          reportRequest.groupBy || 'day',
        );
        data = categoryData.data;
        totalAmount = categoryData.total;

        // Calculate comparison if requested
        if (reportRequest.compareWithPrevious) {
          const previousPeriodData = await this.getPreviousPeriodData(
            userId,
            startDate,
            endDate,
            'category',
            { ...filters, categoryId: filters.categoryIds[0] },
          );
          compareAmount = previousPeriodData.total;
        }
        break;

      default:
        throw new Error(`Unsupported report type: ${reportRequest.type}`);
    }

    // Calculate change percentage
    let changePercentage = 0;
    if (compareAmount !== 0) {
      changePercentage = ((totalAmount - compareAmount) / Math.abs(compareAmount)) * 100;
    }

    return {
      title: reportRequest.title,
      summary: {
        totalAmount,
        compareAmount: reportRequest.compareWithPrevious ? compareAmount : undefined,
        changePercentage: reportRequest.compareWithPrevious ? changePercentage : undefined,
      },
      data,
      metadata: {
        timeframe: reportRequest.timeframe,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        filters,
      },
    };
  }

  // Helper methods
  private calculateDateRange(
    period: string,
    startDateStr?: string,
    endDateStr?: string,
  ): { startDate: Date; endDate: Date } {
    const endDate = endDateStr ? new Date(endDateStr) : new Date();
    let startDate: Date;

    if (startDateStr) {
      startDate = new Date(startDateStr);
    } else {
      // Calculate start date based on period
      startDate = new Date(endDate);

      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 1); // Default to month
      }
    }

    return { startDate, endDate };
  }

  private calculateCustomDateRange(
    timeframe: string,
    startDateStr?: string,
    endDateStr?: string,
  ): { startDate: Date; endDate: Date } {
    if (timeframe === 'custom') {
      if (!startDateStr || !endDateStr) {
        throw new Error('Start date and end date are required for custom timeframe');
      }

      return {
        startDate: new Date(startDateStr),
        endDate: new Date(endDateStr),
      };
    }

    return this.calculateDateRange(timeframe, startDateStr, endDateStr);
  }

  private formatDateForPeriod(date: Date, period: string): string {
    switch (period) {
      case 'week':
        // Format as YYYY-WW (year and week number)
        const weekNumber = this.getISOWeek(date);
        return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;

      case 'month':
        // Format as YYYY-MM
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      case 'quarter':
        // Format as YYYY-Q# (year and quarter)
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()}-Q${quarter}`;

      case 'year':
        // Format as YYYY
        return date.getFullYear().toString();

      default:
        // Default to YYYY-MM-DD
        return date.toISOString().split('T')[0];
    }
  }

  private getISOWeek(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  private getPeriodDurationInDays(period: string): number {
    switch (period) {
      case 'week':
        return 7;
      case 'month':
        return 30; // Approximation
      case 'quarter':
        return 90; // Approximation
      case 'year':
        return 365; // Approximation
      default:
        return 30; // Default to month
    }
  }

  private async generateNetWorthTimeSeries(
    userId: string,
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month' | 'year',
    accounts: any[],
  ): Promise<{ date: string; assets: number; liabilities: number; netWorth: number }[]> {
    // Get all transactions in the date range
    const transactions = await this.transactionModel.findByDateRange(userId, startDate, endDate);

    // Generate date points based on interval
    const datePoints: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      datePoints.push(new Date(current));

      // Increment based on interval
      switch (interval) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'year':
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }

    // If the last point isn't the end date, add it
    if (datePoints[datePoints.length - 1].getTime() !== endDate.getTime()) {
      datePoints.push(new Date(endDate));
    }

    // Calculate net worth at each date point
    const result = [];

    for (const datePoint of datePoints) {
      // Start with current account balances
      let assets = 0;
      let liabilities = 0;

      // Adjust balances based on transactions up to this date point
      for (const account of accounts) {
        let balance = account.balance;

        // Apply transactions in reverse (from now back to the date point)
        for (const transaction of transactions.filter(
          (t) => t.accountId === account._id!.toString() && t.date > datePoint,
        )) {
          if (transaction.type === 'income') {
            balance -= transaction.amount;
          } else if (transaction.type === 'expense') {
            balance += transaction.amount;
          }
          // Handle transfers if implemented
        }

        // Categorize as asset or liability
        if (['credit', 'loan'].includes(account.type) && balance < 0) {
          liabilities += Math.abs(balance);
        } else {
          assets += balance;
        }
      }

      const netWorth = assets - liabilities;
      result.push({
        date: datePoint.toISOString().split('T')[0], // Format as YYYY-MM-DD
        assets,
        liabilities,
        netWorth,
      });
    }

    return result;
  }

  private async generateSpendingReport(
    userId: string,
    startDate: Date,
    endDate: Date,
    groupBy: string,
    filters: Record<string, any>,
  ): Promise<{ data: any[]; total: number }> {
    // Build query for transactions
    const query: any = {
      userId,
      date: { $gte: startDate, $lte: endDate },
      type: 'expense',
    };

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      query.categoryId = { $in: filters.categoryIds };
    }

    if (filters.accountIds && filters.accountIds.length > 0) {
      query.accountId = { $in: filters.accountIds };
    }

    // Get transactions
    const transactions = await this.transactionModel.collection.find(query).toArray();

    // Calculate total
    const total = await transactions.reduce((sum, t) => sum + t.amount, 0);

    // Group data based on groupBy parameter
    const groupedData: Record<string, number> = {};

    if (groupBy === 'category') {
      // Group by category
      for (const transaction of transactions) {
        const categoryId = transaction.categoryId || 'uncategorized';
        groupedData[categoryId] = (groupedData[categoryId] || 0) + transaction.amount;
      }

      // Get category names
      const categoryIds = Object.keys(groupedData).filter((id) => id !== 'uncategorized');
      const categories = await this.categoryModel.findByIds(categoryIds, userId);
      const categoryMap = new Map(categories.map((c) => [c._id!.toString(), c.name]));

      // Format data
      const data = Object.entries(groupedData).map(([categoryId, amount]) => ({
        categoryId,
        categoryName:
          categoryId === 'uncategorized'
            ? 'Uncategorized'
            : categoryMap.get(categoryId) || 'Unknown',
        amount,
        percentage: (amount / total) * 100,
      }));

      return { data, total };
    } else {
      // Group by time period
      for (const transaction of transactions) {
        const date = this.formatDateForPeriod(transaction.date, groupBy);
        groupedData[date] = (groupedData[date] || 0) + transaction.amount;
      }

      // Format data
      const data = Object.entries(groupedData)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return { data, total };
    }
  }

  private async generateIncomeReport(
    userId: string,
    startDate: Date,
    endDate: Date,
    groupBy: string,
    filters: Record<string, any>,
  ): Promise<{ data: any[]; total: number }> {
    // Build query for transactions
    const query: any = {
      userId,
      date: { $gte: startDate, $lte: endDate },
      type: 'income',
    };

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      query.categoryId = { $in: filters.categoryIds };
    }

    if (filters.accountIds && filters.accountIds.length > 0) {
      query.accountId = { $in: filters.accountIds };
    }

    // Get transactions
    const transactions = await this.transactionModel.collection.find(query).toArray();

    // Calculate total
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Group data based on groupBy parameter
    const groupedData: Record<string, number> = {};

    if (groupBy === 'category') {
      // Group by category
      for (const transaction of transactions) {
        const categoryId = transaction.categoryId || 'uncategorized';
        groupedData[categoryId] = (groupedData[categoryId] || 0) + transaction.amount;
      }

      // Get category names
      const categoryIds = Object.keys(groupedData).filter((id) => id !== 'uncategorized');
      const categories = await this.categoryModel.findByIds(categoryIds, userId);
      const categoryMap = new Map(categories.map((c) => [c._id!.toString(), c.name]));

      // Format data
      const data = Object.entries(groupedData).map(([categoryId, amount]) => ({
        categoryId,
        categoryName:
          categoryId === 'uncategorized'
            ? 'Uncategorized'
            : categoryMap.get(categoryId) || 'Unknown',
        amount,
        percentage: (amount / total) * 100,
      }));

      return { data, total };
    } else {
      // Group by time period
      for (const transaction of transactions) {
        const date = this.formatDateForPeriod(transaction.date, groupBy);
        groupedData[date] = (groupedData[date] || 0) + transaction.amount;
      }

      // Format data
      const data = Object.entries(groupedData)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return { data, total };
    }
  }

  private async generateCategoryReport(
    userId: string,
    startDate: Date,
    endDate: Date,
    categoryId: string,
    groupBy: string,
  ): Promise<{ data: any[]; total: number }> {
    // Get category
    const category = await this.categoryModel.findById(categoryId, userId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Get transactions
    const transactions = await this.transactionModel.findByDateRangeAndCategory(
      userId,
      startDate,
      endDate,
      categoryId,
    );

    // Calculate total spent
    const total = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Group by time period
    const groupedData: Record<string, number> = {};

    for (const transaction of transactions) {
      if (transaction.type === 'expense') {
        const date = this.formatDateForPeriod(transaction.date, groupBy);
        groupedData[date] = (groupedData[date] || 0) + transaction.amount;
      }
    }

    // Format data
    const data = Object.entries(groupedData)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { data, total };
  }

  private async getPreviousPeriodData(
    userId: string,
    startDate: Date,
    endDate: Date,
    type: 'expense' | 'income' | 'category',
    filters: Record<string, any>,
  ): Promise<{ total: number }> {
    // Calculate previous period dates
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousPeriodEndDate = new Date(startDate.getTime() - 1); // 1 millisecond before startDate
    const previousPeriodStartDate = new Date(previousPeriodEndDate.getTime() - periodLength);

    // Build query for transactions
    const query: any = {
      userId,
      date: { $gte: previousPeriodStartDate, $lte: previousPeriodEndDate },
    };

    if (type === 'expense') {
      query.type = 'expense';
    } else if (type === 'income') {
      query.type = 'income';
    } else if (type === 'category') {
      query.categoryId = filters.categoryId;
      query.type = 'expense'; // Assuming we're looking at expenses for a category
    }

    if (filters.categoryIds && filters.categoryIds.length > 0 && type !== 'category') {
      query.categoryId = { $in: filters.categoryIds };
    }

    if (filters.accountIds && filters.accountIds.length > 0) {
      query.accountId = { $in: filters.accountIds };
    }

    // Get transactions
    const transactions = await this.transactionModel.collection.find(query).toArray();

    // Calculate total
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);

    return { total };
  }
}
