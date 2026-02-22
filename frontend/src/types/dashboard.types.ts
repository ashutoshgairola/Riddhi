// src/types/dashboard.types.ts

export interface DashboardSummary {
  netWorth: number;
  netWorthChange: number;
  netWorthChangePercent: number;
  monthlyIncome: number;
  monthlyIncomeChange: number;
  monthlyIncomeChangePercent: number;
  monthlyExpenses: number;
  monthlyExpensesChange: number;
  monthlyExpensesChangePercent: number;
  savingsRate: number;
  savingsRateChange: number;
}

export interface CashFlowPoint {
  month: string;
  income: number;
  expenses: number;
}

export interface ExpenseCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color?: string;
}

export interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  categoryId: string;
  categoryName: string;
  accountId: string;
}

export interface BudgetCategoryProgress {
  name: string;
  allocated: number;
  spent: number;
  color?: string;
}

export interface GoalSummary {
  id: string;
  name: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  color?: string;
  status: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  cashFlow: CashFlowPoint[];
  expenseBreakdown: ExpenseCategory[];
  recentTransactions: RecentTransaction[];
  budgetProgress: BudgetCategoryProgress[];
  goals: GoalSummary[];
}
