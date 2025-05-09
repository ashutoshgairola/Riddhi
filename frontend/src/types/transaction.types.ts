export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface TransactionCategory {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
  parentId?: string;
  parent?: TransactionCategory;
  subcategories?: TransactionCategory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  category?: TransactionCategory;
  accountId: string;
  status: TransactionStatus;
  notes?: string;
  tags?: string[];
  attachments?: string[];
  isRecurring?: boolean;
  recurringDetails?: RecurringDetails;
  createdAt?: string;
  updatedAt?: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionStatus = 'pending' | 'cleared' | 'reconciled' | 'void';

export interface RecurringDetails {
  frequency: RecurringFrequency;
  interval: number;
  endDate?: string;
  nextDate?: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  types?: TransactionType[];
  categoryIds?: string[];
  accountIds?: string[];
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  tags?: string[];
  status?: TransactionStatus[];
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  categorySummary: Array<{
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    transactionCount: number;
  }>;
  periodStart: string;
  periodEnd: string;
}

export interface TransactionCreateDTO {
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  status?: TransactionStatus;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringDetails?: RecurringDetails;
}

export interface TransactionUpdateDTO {
  id: string;
  date?: string;
  description?: string;
  amount?: number;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  status?: TransactionStatus;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringDetails?: RecurringDetails;
}
