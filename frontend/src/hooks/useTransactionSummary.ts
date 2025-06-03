// src/hooks/useTransactionSummary.ts (updated)
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
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

  // Get auth context to check authentication status
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchSummary = useCallback(
    async (filters?: Omit<TransactionFilters, 'page' | 'limit' | 'sort' | 'order'>) => {
      if (!isAuthenticated || authLoading) return;

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
    [isAuthenticated, authLoading],
  );

  // Fetch summary on initial render if authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchSummary(initialFilters);
    }
  }, [fetchSummary, initialFilters, isAuthenticated, authLoading]);

  return {
    summary,
    loading: loading || authLoading,
    error,
    fetchSummary,
  };
};
