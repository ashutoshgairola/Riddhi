// Budget domain types
import { ObjectId } from "mongodb";

export interface Budget {
  _id?: string | ObjectId;
  userId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  categories: BudgetCategory[];
  totalAllocated: number;
  totalSpent: number;
  income: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCategory {
  _id?: string | ObjectId;
  name: string;
  allocated: number;
  spent: number;
  categoryId: string;
  color?: string;
  icon?: string;
  rollover?: boolean;
  notes?: string;
}

export interface BudgetDTO {
  id: string;
  name: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  categories: BudgetCategoryDTO[];
  totalAllocated: number;
  totalSpent: number;
  income: number;
}

export interface BudgetCategoryDTO {
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

export interface BudgetSummaryDTO {
  id: string;
  name: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  totalAllocated: number;
  totalSpent: number;
  income: number;
}

// Request types
export interface GetBudgetsQuery {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateBudgetRequest {
  name: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  categories: {
    name: string;
    allocated: number;
    categoryId: string;
    color?: string;
    icon?: string;
    rollover?: boolean;
    notes?: string;
  }[];
  income: number;
}

export interface UpdateBudgetRequest {
  name?: string;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  income?: number;
}

export interface CreateBudgetCategoryRequest {
  name: string;
  allocated: number;
  categoryId: string;
  color?: string;
  icon?: string;
  rollover?: boolean;
  notes?: string;
}

export interface UpdateBudgetCategoryRequest {
  name?: string;
  allocated?: number;
  color?: string;
  icon?: string;
  rollover?: boolean;
  notes?: string;
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface BudgetsResponse {
  data: BudgetSummaryDTO[];
  pagination: PaginationResponse;
}
