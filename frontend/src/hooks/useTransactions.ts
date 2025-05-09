// src/hooks/useTransactions.ts
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../services/api/apiClient';
import transactionService from '../services/api/transactionService';
import {
  Transaction,
  TransactionCreateDTO,
  TransactionFilters,
  TransactionUpdateDTO,
} from '../types/transaction.types';

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: ApiError | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  createTransaction: (data: TransactionCreateDTO) => Promise<Transaction | null>;
  updateTransaction: (data: TransactionUpdateDTO) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  uploadAttachment: (id: string, file: File) => Promise<string | null>;
}

export const useTransactions = (initialFilters?: TransactionFilters): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialFilters?.page || 1);

  const previousFiltersRef = useRef<TransactionFilters | undefined>(initialFilters);

  const fetchTransactions = useCallback(async (filters?: TransactionFilters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await transactionService.getAll(filters);
      setTransactions(response.data.items || []);
      setTotalItems(response.data.total);
      setTotalPages(response.data.pages);
      setCurrentPage(response.data.page);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = async (data: TransactionCreateDTO): Promise<Transaction | null> => {
    setError(null);

    try {
      const response = await transactionService.create(data);

      fetchTransactions({
        page: currentPage,
        limit: Math.ceil(totalItems / totalPages) || 10, // Prevent division by zero
      });
      return response.data;
    } catch (err) {
      setError(err as ApiError);
      return null;
    }
  };

  const updateTransaction = async (data: TransactionUpdateDTO): Promise<Transaction | null> => {
    setError(null);

    try {
      const response = await transactionService.update(data);

      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === data.id ? { ...transaction, ...response.data } : transaction,
        ),
      );

      return response.data;
    } catch (err) {
      setError(err as ApiError);
      return null;
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    setError(null);

    try {
      await transactionService.delete(id);

      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));

      if (transactions.length === 1 && currentPage > 1) {
        fetchTransactions({
          ...previousFiltersRef.current,
          page: currentPage - 1,
        });
      }

      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    }
  };

  const uploadAttachment = async (id: string, file: File): Promise<string | null> => {
    setError(null);

    try {
      const response = await transactionService.uploadAttachment(id, file);
      return response.data.url;
    } catch (err) {
      setError(err as ApiError);
      return null;
    }
  };

  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousFiltersRef.current = initialFilters;
      fetchTransactions(initialFilters);
      return;
    }

    const filtersChanged =
      JSON.stringify(initialFilters) !== JSON.stringify(previousFiltersRef.current);

    if (filtersChanged) {
      previousFiltersRef.current = initialFilters;
      fetchTransactions(initialFilters);
    }
  }, [fetchTransactions, initialFilters]);

  return {
    transactions,
    loading,
    error,
    totalItems,
    totalPages,
    currentPage,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    uploadAttachment,
  };
};
