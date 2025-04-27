// src/types/budget.types.ts
export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  categoryId: string;
  color?: string;
  icon?: string;
  rollover?: boolean;
  notes?: string;
}

export interface Budget {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  categories: BudgetCategory[];
  totalAllocated: number;
  totalSpent: number;
  income: number;
}
