// src/types/budget.types.ts
export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  categoryIds: string[];
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

// src/types/budget.types.ts

// Budget category type
export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  categoryIds: string[]; // References to transaction categories
  color?: string;
  icon?: string;
  rollover?: boolean;
  notes?: string;
}

// Budget type
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

// Budget filters for fetching history
export interface BudgetFilters {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// DTOs for creating and updating budgets
export interface BudgetCreateDTO {
  name: string;
  startDate: string;
  endDate: string;
  categories: Array<{
    name: string;
    allocated: number;
    categoryIds: string[];
    color?: string;
    icon?: string;
    rollover?: boolean;
    notes?: string;
  }>;
  income: number;
}

export interface BudgetUpdateDTO {
  name?: string;
  startDate?: string;
  endDate?: string;
  categories?: Array<{
    id?: string;
    name: string;
    allocated: number;
    categoryIds: string[];
    color?: string;
    icon?: string;
    rollover?: boolean;
    notes?: string;
  }>;
  income?: number;
}

// Budget category DTOs
export interface BudgetCategoryCreateDTO {
  name: string;
  allocated: number;
  categoryIds: string[];
  color?: string;
  icon?: string;
  rollover?: boolean;
  notes?: string;
}

export interface BudgetCategoryUpdateDTO {
  name?: string;
  allocated?: number;
  categoryIds?: string[];
  color?: string;
  icon?: string;
  rollover?: boolean;
  notes?: string;
}
