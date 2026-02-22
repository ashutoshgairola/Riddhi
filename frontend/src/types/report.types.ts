// src/types/report.types.ts
export type ReportTimeframe = 'week' | 'month' | 'quarter' | 'year' | 'custom';
export type NetWorthPeriod = 'month' | 'quarter' | 'year' | 'all';
export type ReportType = 'spending' | 'income' | 'net_worth' | 'category' | 'custom';

export interface ReportConfig {
  type: ReportType;
  title: string;
  timeframe: ReportTimeframe;
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  accountIds?: string[];
  compareWithPrevious?: boolean;
  groupBy?: 'day' | 'week' | 'month' | 'category';
}

// ── Query params ─────────────────────────────────────────────────────────────

export interface IncomeExpenseQuery {
  period: ReportTimeframe;
  startDate?: string;
  endDate?: string;
}

export interface AccountSummaryQuery {
  startDate?: string;
  endDate?: string;
}

export interface NetWorthQuery {
  period: NetWorthPeriod;
}

export interface CategoryReportQuery {
  categoryId: string;
  period: ReportTimeframe;
  startDate?: string;
  endDate?: string;
}

export interface BudgetPerformanceQuery {
  budgetId?: string;
}

export interface CustomReportRequest {
  title: string;
  type: ReportType;
  timeframe: ReportTimeframe;
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  accountIds?: string[];
  compareWithPrevious?: boolean;
  groupBy?: 'day' | 'week' | 'month' | 'category';
}

// ── Response shapes ───────────────────────────────────────────────────────────

export interface AccountSummaryResponse {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    changeAmount: number;
    changePercentage: number;
  }[];
}

export interface IncomeExpenseResponse {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number;
  incomeByCategory: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
  expensesByCategory: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
  timeSeriesData: {
    date: string;
    income: number;
    expenses: number;
  }[];
}

export interface NetWorthResponse {
  currentNetWorth: number;
  changeAmount: number;
  changePercentage: number;
  timeSeriesData: {
    date: string;
    assets: number;
    liabilities: number;
    netWorth: number;
  }[];
}

export interface CategoryReportResponse {
  categoryId: string;
  categoryName: string;
  totalSpent: number;
  averagePerPeriod: number;
  previousPeriodComparison: number;
  timeSeriesData: { date: string; amount: number }[];
  transactions: { id: string; date: string; description: string; amount: number }[];
}

export interface BudgetPerformanceResponse {
  budgetId: string;
  budgetName: string;
  startDate: string;
  endDate: string;
  totalBudgeted: number;
  totalSpent: number;
  remainingBudget: number;
  overBudgetAmount: number;
  categories: {
    categoryIds: string[];
    categoryName: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentUsed: number;
    status: 'under' | 'on_track' | 'over';
  }[];
  trends: {
    dailyAverage: number;
    projectedTotal: number;
    willExceedBudget: boolean;
  };
}

export interface CustomReportResponse {
  title: string;
  summary: {
    totalAmount: number;
    compareAmount?: number;
    changePercentage?: number;
  };
  data: unknown[];
  metadata: {
    timeframe: string;
    startDate: string;
    endDate: string;
    filters: Record<string, unknown>;
  };
}
