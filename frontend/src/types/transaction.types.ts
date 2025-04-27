// src/types/transaction.types.ts
export type TransactionType = "income" | "expense" | "transfer";
export type TransactionStatus = "cleared" | "pending" | "reconciled";

export interface TransactionCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  parentId?: string;
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
  notes?: string;
  status: TransactionStatus;
  tags?: string[];
  attachments?: Attachment[];
  isRecurring?: boolean;
  recurringId?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
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
}
