// src/services/api/transactionService.ts
import {
  RecurringTransactionSettings,
  Transaction,
  TransactionAttachment,
  TransactionCreateDTO,
  TransactionFilters,
  TransactionSummary,
  TransactionType,
  TransactionUpdateDTO,
} from '../../types/transaction.types';
import apiClient, { ApiResponse, PaginatedResponse } from './apiClient';

class TransactionService {
  private baseUrl = '/api/transactions';

  // ----- Basic Transaction Operations -----

  public async getAll(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            if (key === 'types') {
              queryParams.append(key, value.join(','));
            } else if (key === 'categoryIds' || key === 'accountIds' || key === 'tags') {
              queryParams.append(key, value.join(','));
            } else {
              value.forEach((item) => queryParams.append(`${key}[]`, item));
            }
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    return apiClient.get<PaginatedResponse<Transaction>>(url);
  }

  public async getById(id: string): Promise<ApiResponse<Transaction>> {
    return apiClient.get<ApiResponse<Transaction>>(`${this.baseUrl}/${id}`);
  }

  public async create(transaction: TransactionCreateDTO): Promise<ApiResponse<Transaction>> {
    return apiClient.post<ApiResponse<Transaction>, TransactionCreateDTO>(
      this.baseUrl,
      transaction,
    );
  }

  public async update(transaction: TransactionUpdateDTO): Promise<ApiResponse<Transaction>> {
    return apiClient.put<ApiResponse<Transaction>, TransactionUpdateDTO>(
      `${this.baseUrl}/${transaction.id}`,
      transaction,
    );
  }

  public async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  // ----- Transaction Attachments -----

  public async uploadAttachment(
    id: string,
    file: File,
  ): Promise<ApiResponse<TransactionAttachment>> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<ApiResponse<TransactionAttachment>, FormData>(
      `${this.baseUrl}/${id}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  }

  public async getAttachments(id: string): Promise<ApiResponse<TransactionAttachment[]>> {
    return apiClient.get<ApiResponse<TransactionAttachment[]>>(`${this.baseUrl}/${id}/attachments`);
  }

  public async deleteAttachment(
    transactionId: string,
    attachmentId: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `${this.baseUrl}/${transactionId}/attachments/${attachmentId}`,
    );
  }

  // ----- Transaction Summary and Analytics -----

  public async getSummary(
    filters?: Omit<TransactionFilters, 'page' | 'limit' | 'sort' | 'order'>,
  ): Promise<ApiResponse<TransactionSummary>> {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            if (key === 'types') {
              queryParams.append(key, value.join(','));
            } else if (key === 'categoryIds' || key === 'accountIds' || key === 'tags') {
              queryParams.append(key, value.join(','));
            } else {
              value.forEach((item) => queryParams.append(`${key}[]`, item));
            }
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const url = `${this.baseUrl}/summary?${queryParams.toString()}`;
    return apiClient.get<ApiResponse<TransactionSummary>>(url);
  }

  public async getMonthlyTrends(year: number): Promise<
    ApiResponse<
      {
        month: number;
        income: number;
        expense: number;
        netBalance: number;
      }[]
    >
  > {
    return apiClient.get<
      ApiResponse<{ month: number; income: number; expense: number; netBalance: number }[]>
    >(`${this.baseUrl}/trends/monthly?year=${year}`);
  }

  public async getCategoryBreakdown(
    startDate?: string,
    endDate?: string,
    type?: TransactionType,
  ): Promise<
    ApiResponse<
      {
        categoryId: string;
        categoryName: string;
        amount: number;
        percentage: number;
        transactionCount: number;
      }[]
    >
  > {
    const queryParams = new URLSearchParams();

    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (type) queryParams.append('type', type);

    const url = `${this.baseUrl}/breakdown/category?${queryParams.toString()}`;
    return apiClient.get<
      ApiResponse<
        {
          categoryId: string;
          categoryName: string;
          amount: number;
          percentage: number;
          transactionCount: number;
        }[]
      >
    >(url);
  }

  // ----- Recurring Transactions -----

  public async getRecurringTransactions(
    filters?: TransactionFilters,
  ): Promise<PaginatedResponse<Transaction[]>> {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            if (key === 'types') {
              queryParams.append(key, value.join(','));
            } else if (key === 'categoryIds' || key === 'accountIds' || key === 'tags') {
              queryParams.append(key, value.join(','));
            } else {
              value.forEach((item) => queryParams.append(`${key}[]`, item));
            }
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const url = `${this.baseUrl}/recurring?${queryParams.toString()}`;
    return apiClient.get<PaginatedResponse<Transaction[]>>(url);
  }

  public async updateRecurringTransaction(
    id: string,
    settings: Partial<RecurringTransactionSettings>,
  ): Promise<ApiResponse<RecurringTransactionSettings>> {
    return apiClient.put<
      ApiResponse<RecurringTransactionSettings>,
      Partial<RecurringTransactionSettings>
    >(`${this.baseUrl}/${id}/recurring`, settings);
  }

  public async stopRecurringTransaction(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}/recurring`);
  }

  // ----- Import/Export -----

  public async importTransactions(file: File): Promise<
    ApiResponse<{
      imported: number;
      failed: number;
      failures?: { line: number; reason: string }[];
    }>
  > {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<
      ApiResponse<{
        imported: number;
        failed: number;
        failures?: { line: number; reason: string }[];
      }>,
      FormData
    >(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  public async exportTransactions(
    format: 'csv' | 'json' | 'pdf' | 'excel',
    filters?: Omit<TransactionFilters, 'page' | 'limit'>,
  ): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            if (key === 'types') {
              queryParams.append(key, value.join(','));
            } else if (key === 'categoryIds' || key === 'accountIds' || key === 'tags') {
              queryParams.append(key, value.join(','));
            } else {
              value.forEach((item) => queryParams.append(`${key}[]`, item));
            }
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const url = `${this.baseUrl}/export?${queryParams.toString()}`;
    return apiClient.request<Blob>({
      url,
      method: 'GET',
      responseType: 'blob',
    });
  }

  // ----- Batch Operations -----

  public async batchUpdate(
    transactionIds: string[],
    updates: Partial<Omit<TransactionUpdateDTO, 'id'>>,
  ): Promise<ApiResponse<{ updatedCount: number }>> {
    return apiClient.put<
      ApiResponse<{ updatedCount: number }>,
      { ids: string[]; updates: Partial<Omit<TransactionUpdateDTO, 'id'>> }
    >(`${this.baseUrl}/batch`, {
      ids: transactionIds,
      updates,
    });
  }

  public async batchDelete(
    transactionIds: string[],
  ): Promise<ApiResponse<{ deletedCount: number }>> {
    return apiClient.request<ApiResponse<{ deletedCount: number }>>({
      url: `${this.baseUrl}/batch`,
      method: 'DELETE',
      data: { ids: transactionIds },
    });
  }

  // ----- Transaction Reconciliation -----

  public async reconcileTransactions(
    accountId: string,
    endingBalance: number,
    transactionIds: string[],
  ): Promise<ApiResponse<{ reconciledCount: number }>> {
    return apiClient.post<
      ApiResponse<{ reconciledCount: number }>,
      { accountId: string; endingBalance: number; transactionIds: string[] }
    >(`${this.baseUrl}/reconcile`, {
      accountId,
      endingBalance,
      transactionIds,
    });
  }
}

export const transactionService = new TransactionService();
export default transactionService;
