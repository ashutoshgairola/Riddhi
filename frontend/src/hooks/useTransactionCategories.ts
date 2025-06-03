// src/hooks/useTransactionCategories.ts (updated)
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api/apiClient';
import {
  CategoryCreateDTO,
  CategoryUpdateDTO,
  categoryService,
} from '../services/api/categoryService';
import { TransactionCategory } from '../types/transaction.types';

interface UseTransactionCategoriesReturn {
  categories: TransactionCategory[];
  loading: boolean;
  error: ApiError | null;
  fetchCategories: () => Promise<void>;
  createCategory: (data: CategoryCreateDTO) => Promise<TransactionCategory | null>;
  updateCategory: (data: CategoryUpdateDTO) => Promise<TransactionCategory | null>;
  deleteCategory: (id: string) => Promise<boolean>;
}

export const useTransactionCategories = (): UseTransactionCategoriesReturn => {
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Get auth context to check authentication status
  const { isAuthenticated, loading: authLoading } = useAuth();

  const hasFetchedRef = useRef(false);

  const fetchCategories = useCallback(async () => {
    if (!isAuthenticated || authLoading || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await categoryService.getAll();
      setCategories(response.data);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [loading, isAuthenticated, authLoading]);

  const createCategory = async (data: CategoryCreateDTO): Promise<TransactionCategory | null> => {
    if (!isAuthenticated || authLoading) return null;

    setError(null);

    try {
      const response = await categoryService.create(data);

      setCategories((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err as ApiError);
      return null;
    }
  };

  const updateCategory = async (data: CategoryUpdateDTO): Promise<TransactionCategory | null> => {
    if (!isAuthenticated || authLoading) return null;

    setError(null);

    try {
      const response = await categoryService.update(data);

      setCategories((prev) =>
        prev.map((category) =>
          category.id === data.id ? { ...category, ...response.data } : category,
        ),
      );

      return response.data;
    } catch (err) {
      setError(err as ApiError);
      return null;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    if (!isAuthenticated || authLoading) return false;

    setError(null);

    try {
      await categoryService.delete(id);

      setCategories((prev) => prev.filter((category) => category.id !== id));

      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    }
  };

  useEffect(() => {
    // Only fetch data if authenticated and auth check is complete
    if (isAuthenticated && !authLoading && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      setLoading(true);

      categoryService
        .getAll()
        .then((response) => {
          setCategories(response.data);
          setError(null);
        })
        .catch((err) => {
          setError(err as ApiError);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isAuthenticated, authLoading]);

  return {
    categories,
    loading: loading || authLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
