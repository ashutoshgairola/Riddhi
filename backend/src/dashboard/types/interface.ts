// backend/src/dashboard/types/interface.ts

export interface DashboardSummary {
  netWorth: number;
  netWorthChange: number; // absolute change vs previous month
  netWorthChangePercent: number;
  monthlyIncome: number;
  monthlyIncomeChange: number;
  monthlyIncomeChangePercent: number;
  monthlyExpenses: number;
  monthlyExpensesChange: number;
  monthlyExpensesChangePercent: number;
  savingsRate: number; // percentage
  savingsRateChange: number; // percentage point change vs previous month
}

export interface CashFlowPoint {
  month: string; // e.g. "Jan 2025"
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
  date: string; // ISO string
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
