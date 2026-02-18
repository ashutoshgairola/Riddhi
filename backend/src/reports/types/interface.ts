// Reports domain types

export interface AccountSummaryQuery {
  startDate?: string;
  endDate?: string;
}
export type Timeframe = 'week' | 'month' | 'quarter' | 'year' | 'custom';
export interface IncomeExpenseQuery {
  period: Timeframe;
  startDate?: string;
  endDate?: string;
}

export interface CategoryReportQuery {
  categoryId: string;
  period: Timeframe;
  startDate?: string;
  endDate?: string;
}

export interface BudgetPerformanceQuery {
  budgetId?: string;
}
export type NetWorthPeriod = 'month' | 'quarter' | 'year' | 'all';
export interface NetWorthQuery {
  period: NetWorthPeriod;
}
export type GroupByOption = 'day' | 'week' | 'month' | 'category';
export interface CustomReportRequest {
  title: string;
  type: 'spending' | 'income' | 'net_worth' | 'category' | 'custom';
  timeframe: Timeframe;
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  accountIds?: string[];
  compareWithPrevious?: boolean;
  groupBy?: GroupByOption;
}

// Response types
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

export interface CategoryReportResponse {
  categoryId: string;
  categoryName: string;
  totalSpent: number;
  averagePerPeriod: number;
  previousPeriodComparison: number; // Percentage change
  timeSeriesData: {
    date: string;
    amount: number;
  }[];
  transactions: {
    id: string;
    date: string;
    description: string;
    amount: number;
  }[];
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

export interface CustomReportResponse {
  title: string;
  summary: {
    totalAmount: number;
    compareAmount?: number;
    changePercentage?: number;
  };
  data: any[]; // Varies based on report type and configuration
  metadata: {
    timeframe: string;
    startDate: string;
    endDate: string;
    filters: Record<string, any>;
  };
}
