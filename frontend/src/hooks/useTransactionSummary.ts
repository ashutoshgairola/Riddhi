// src/hooks/useTransactionSummary.ts
import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '../services/api/apiClient';
import transactionService from '../services/api/transactionService';
import { TransactionFilters, TransactionSummary } from '../types/transaction.types';

interface UseTransactionSummaryReturn {
  summary: TransactionSummary | null;
  loading: boolean;
  error: ApiError | null;
  fetchSummary: (
    filters?: Omit<TransactionFilters, 'page' | 'limit' | 'sort' | 'order'>,
  ) => Promise<void>;
}

export const useTransactionSummary = (
  initialFilters?: Omit<TransactionFilters, 'page' | 'limit' | 'sort' | 'order'>,
): UseTransactionSummaryReturn => {
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchSummary = useCallback(
    async (filters?: Omit<TransactionFilters, 'page' | 'limit' | 'sort' | 'order'>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await transactionService.getSummary(filters);
        setSummary(response.data);
      } catch (err) {
        setError(err as ApiError);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch summary on initial render
  useEffect(() => {
    fetchSummary(initialFilters);
  }, [fetchSummary, initialFilters]);

  return {
    summary,
    loading,
    error,
    fetchSummary,
  };
};
