// backend/src/dashboard/service.ts
import { Db } from 'mongodb';

import { AccountModel } from '../accounts/db';
import { BudgetModel } from '../budgets/db';
import { GoalModel } from '../goals/db';
import { CategoryModel } from '../transactions/category-db';
import { TransactionModel } from '../transactions/db';
import {
  BudgetCategoryProgress,
  CashFlowPoint,
  DashboardData,
  DashboardSummary,
  ExpenseCategory,
  GoalSummary,
  RecentTransaction,
} from './types/interface';

export class DashboardService {
  private transactionModel: TransactionModel;
  private budgetModel: BudgetModel;
  private accountModel: AccountModel;
  private categoryModel: CategoryModel;
  private goalModel: GoalModel;

  constructor(db: Db) {
    this.transactionModel = new TransactionModel(db);
    this.budgetModel = new BudgetModel(db);
    this.accountModel = new AccountModel(db);
    this.categoryModel = new CategoryModel(db);
    this.goalModel = new GoalModel(db);
  }

  async initialize(): Promise<void> {
    // No specific initialization needed
  }

  async getDashboardData(userId: string): Promise<DashboardData> {
    const now = new Date();

    // Current month bounds
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Previous month bounds
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [summary, cashFlow, expenseBreakdown, recentTransactions, budgetProgress, goals] =
      await Promise.all([
        this.getSummary(userId, currentMonthStart, currentMonthEnd, prevMonthStart, prevMonthEnd),
        this.getCashFlow(userId, now),
        this.getExpenseBreakdown(userId, currentMonthStart, currentMonthEnd),
        this.getRecentTransactions(userId),
        this.getBudgetProgress(userId),
        this.getGoals(userId),
      ]);

    return { summary, cashFlow, expenseBreakdown, recentTransactions, budgetProgress, goals };
  }

  private async getSummary(
    userId: string,
    currentMonthStart: Date,
    currentMonthEnd: Date,
    prevMonthStart: Date,
    prevMonthEnd: Date,
  ): Promise<DashboardSummary> {
    // Net worth: sum all account balances
    const accounts = await this.accountModel.findAll(userId);
    let totalAssets = 0;
    let totalLiabilities = 0;
    accounts.forEach((account) => {
      if (['credit', 'loan'].includes(account.type) && account.balance < 0) {
        totalLiabilities += Math.abs(account.balance);
      } else {
        totalAssets += account.balance;
      }
    });
    const netWorth = totalAssets - totalLiabilities;

    // Current month transactions
    const currentTxns = await this.transactionModel.findByDateRange(
      userId,
      currentMonthStart,
      currentMonthEnd,
    );

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    currentTxns.forEach((t) => {
      if (t.type === 'income') monthlyIncome += t.amount;
      else if (t.type === 'expense') monthlyExpenses += t.amount;
    });

    // Previous month transactions
    const prevTxns = await this.transactionModel.findByDateRange(
      userId,
      prevMonthStart,
      prevMonthEnd,
    );

    let prevIncome = 0;
    let prevExpenses = 0;
    prevTxns.forEach((t) => {
      if (t.type === 'income') prevIncome += t.amount;
      else if (t.type === 'expense') prevExpenses += t.amount;
    });

    // Previous month net worth approximation: current - net flow
    const currentNetFlow = monthlyIncome - monthlyExpenses;
    const prevNetWorth = netWorth - currentNetFlow;
    const netWorthChange = netWorth - prevNetWorth;
    const netWorthChangePercent =
      prevNetWorth !== 0 ? (netWorthChange / Math.abs(prevNetWorth)) * 100 : 0;

    const monthlyIncomeChange = monthlyIncome - prevIncome;
    const monthlyIncomeChangePercent =
      prevIncome !== 0 ? (monthlyIncomeChange / prevIncome) * 100 : 0;

    const monthlyExpensesChange = monthlyExpenses - prevExpenses;
    const monthlyExpensesChangePercent =
      prevExpenses !== 0 ? (monthlyExpensesChange / prevExpenses) * 100 : 0;

    const savingsRate =
      monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    const prevSavingsRate = prevIncome > 0 ? ((prevIncome - prevExpenses) / prevIncome) * 100 : 0;
    const savingsRateChange = savingsRate - prevSavingsRate;

    return {
      netWorth,
      netWorthChange,
      netWorthChangePercent,
      monthlyIncome,
      monthlyIncomeChange,
      monthlyIncomeChangePercent,
      monthlyExpenses,
      monthlyExpensesChange,
      monthlyExpensesChangePercent,
      savingsRate,
      savingsRateChange,
    };
  }

  private async getCashFlow(userId: string, now: Date): Promise<CashFlowPoint[]> {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const result: CashFlowPoint[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const txns = await this.transactionModel.findByDateRange(userId, start, end);

      let income = 0;
      let expenses = 0;
      txns.forEach((t) => {
        if (t.type === 'income') income += t.amount;
        else if (t.type === 'expense') expenses += t.amount;
      });

      result.push({
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        income,
        expenses,
      });
    }

    return result;
  }

  private async getExpenseBreakdown(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ExpenseCategory[]> {
    const txns = await this.transactionModel.findByDateRange(userId, startDate, endDate);
    const categories = await this.categoryModel.findAll(userId);
    const categoryMap = new Map(categories.map((c) => [c._id?.toString() ?? '', c]));

    const expenseMap = new Map<string, number>();
    let total = 0;

    txns.forEach((t) => {
      if (t.type !== 'expense') return;
      const key = t.categoryId || 'uncategorized';
      expenseMap.set(key, (expenseMap.get(key) || 0) + t.amount);
      total += t.amount;
    });

    return Array.from(expenseMap.entries())
      .map(([categoryId, amount]) => {
        const cat = categoryMap.get(categoryId);
        return {
          categoryId,
          categoryName: cat ? cat.name : 'Uncategorized',
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
          color: cat?.color,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }

  private async getRecentTransactions(userId: string): Promise<RecentTransaction[]> {
    const categories = await this.categoryModel.findAll(userId);
    const categoryMap = new Map(categories.map((c) => [c._id?.toString() ?? '', c]));

    // Get last 5 transactions sorted by date desc
    const txns = await this.transactionModel.collection
      .find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    return txns.map((t) => {
      const cat = t.categoryId ? categoryMap.get(t.categoryId) : undefined;
      return {
        id: t._id?.toString() ?? '',
        date: t.date.toISOString(),
        description: t.description,
        amount: t.amount,
        type: t.type,
        categoryId: t.categoryId || '',
        categoryName: cat ? cat.name : 'Uncategorized',
        accountId: t.accountId,
      };
    });
  }

  private async getBudgetProgress(userId: string): Promise<BudgetCategoryProgress[]> {
    const budget = await this.budgetModel.findCurrent(userId);
    if (!budget) return [];

    return budget.categories.map((cat) => ({
      name: cat.name,
      allocated: cat.allocated,
      spent: cat.spent,
      color: cat.color,
    }));
  }

  private async getGoals(userId: string): Promise<GoalSummary[]> {
    const { goals } = await this.goalModel.findAll(userId, { status: 'active', limit: 3, page: 1 });

    return goals.map((g) => ({
      id: g._id?.toString() ?? '',
      name: g.name,
      type: g.type,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      targetDate: g.targetDate.toISOString(),
      color: g.color,
      status: g.status,
    }));
  }
}
