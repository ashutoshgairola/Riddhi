// Transaction domain types
import { ObjectId } from 'mongodb';

export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'cleared' | 'pending' | 'reconciled';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Transaction {
  _id?: string | ObjectId;
  userId: string;
  date: Date;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  notes?: string;
  status: TransactionStatus;
  tags?: string[];
  attachments?: Attachment[];
  isRecurring?: boolean;
  recurringId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionDTO {
  id: string;
  date: string; // ISO date string
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  category?: CategoryDTO;
  accountId: string;
  notes?: string;
  status: TransactionStatus;
  tags?: string[];
  attachments?: AttachmentDTO[];
  isRecurring?: boolean;
  recurringId?: string;
}

export interface TransactionCategory {
  _id?: string | ObjectId;
  userId: string;
  name: string;
  color?: string;
  icon?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  subcategories?: TransactionCategory[];
}

export interface CategoryDTO {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  parentId?: string;
  subcategories?: CategoryDTO[];
}

export interface Attachment {
  _id?: string | ObjectId;
  fileName: string;
  fileType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
}

export interface AttachmentDTO {
  id: string;
  fileName: string;
  fileType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string; // ISO date string
}

export interface RecurringTransactionDetails {
  frequency: RecurringFrequency;
  interval: number;
  endDate?: Date;
  occurrences?: number;
}

// Request types
export interface GetTransactionsQuery {
  startDate?: string;
  endDate?: string;
  types?: string; // comma-separated list of transaction types
  categoryIds?: string; // comma-separated list of category IDs
  accountIds?: string; // comma-separated list of account IDs
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  tags?: string; // comma-separated list of tags
  status?: string; // comma-separated list of statuses
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateTransactionRequest {
  date: string; // ISO date string
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  notes?: string;
  status: TransactionStatus;
  tags?: string[];
  isRecurring?: boolean;
  recurringDetails?: {
    frequency: RecurringFrequency;
    interval: number;
    endDate?: string; // ISO date string
    occurrences?: number;
  };
}

export interface UpdateTransactionRequest {
  date?: string; // ISO date string
  description?: string;
  amount?: number;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  notes?: string;
  status?: TransactionStatus;
  tags?: string[];
  isRecurring?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

export interface TransactionsResponse {
  items: TransactionDTO[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}