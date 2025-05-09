// src/hooks/useBudget.ts
import { useCallback, useEffect, useRef, useState } from 'react';

import { useBudgets } from '../contexts/BudgetContext';
import { ApiError } from '../services/api/apiClient';
import {
  Budget,
  BudgetCategory,
  BudgetCreateDTO,
  BudgetFilters,
  BudgetUpdateDTO,
} from '../types/budget.types';

interface UseBudgetReturn {
  currentBudget: Budget | null;
  budgetHistory: Budget[];
  loading: boolean;
  error: ApiError | null;
  fetchCurrentBudget: () => Promise<void>;
  fetchBudgetHistory: (filters?: BudgetFilters) => Promise<void>;
  fetchBudgetById: (id: string) => Promise<Budget | null>;
  createBudget: (data: BudgetCreateDTO) => Promise<Budget | null>;
  updateBudget: (id: string, data: BudgetUpdateDTO) => Promise<Budget | null>;
  deleteBudget: (id: string) => Promise<boolean>;
  createBudgetCategory: (
    budgetId: string,
    category: Omit<BudgetCategory, 'id' | 'spent'>,
  ) => Promise<BudgetCategory | null>;
  updateBudgetCategory: (
    budgetId: string,
    categoryId: string,
    data: Partial<BudgetCategory>,
  ) => Promise<BudgetCategory | null>;
  deleteBudgetCategory: (budgetId: string, categoryId: string) => Promise<boolean>;
}

export const useBudget = (initialFilters?: BudgetFilters): UseBudgetReturn => {
  // Get budget context
  const {
    currentBudget,
    budgetHistory,
    isLoading: contextLoading,
    error: contextError,
    getCurrentBudget,
    getBudgetHistory,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
  } = useBudgets();

  // Local loading and error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Track if history has been loaded with filters
  const historyLoadedWithFiltersRef = useRef(false);
  const previousFiltersRef = useRef<BudgetFilters | undefined>(initialFilters);

  // Fetch current budget
  const fetchCurrentBudget = useCallback(async () => {
    try {
      setLoading(true);
      await getCurrentBudget();
      setError(null);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [getCurrentBudget]);

  // Fetch budget history with optional filters
  const fetchBudgetHistory = useCallback(
    async (filters?: BudgetFilters) => {
      try {
        setLoading(true);
        await getBudgetHistory(filters);
        historyLoadedWithFiltersRef.current = true;
        previousFiltersRef.current = filters;
        setError(null);
      } catch (err) {
        setError(err as ApiError);
      } finally {
        setLoading(false);
      }
    },
    [getBudgetHistory],
  );

  // Fetch budget by ID
  const fetchBudgetById = async (id: string): Promise<Budget | null> => {
    try {
      setLoading(true);
      const budget = await getBudgetById(id);
      setError(null);
      return budget;
    } catch (err) {
      setError(err as ApiError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a budget category
  const createBudgetCategory = async (
    budgetId: string,
    category: Omit<BudgetCategory, 'id' | 'spent'>,
  ): Promise<BudgetCategory | null> => {
    try {
      setLoading(true);
      const newCategory = await addBudgetCategory(budgetId, category);
      setError(null);
      return newCategory;
    } catch (err) {
      setError(err as ApiError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch budget history with initial filters if provided
  useEffect(() => {
    const filtersChanged =
      !historyLoadedWithFiltersRef.current ||
      JSON.stringify(initialFilters) !== JSON.stringify(previousFiltersRef.current);

    if (filtersChanged && initialFilters) {
      fetchBudgetHistory(initialFilters);
    }
  }, [fetchBudgetHistory, initialFilters]);

  // Combine context and local loading/error states
  const combinedLoading = contextLoading || loading;
  const combinedError = error || contextError;

  return {
    currentBudget,
    budgetHistory,
    loading: combinedLoading,
    error: combinedError,
    fetchCurrentBudget,
    fetchBudgetHistory,
    fetchBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    createBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
  };
};
