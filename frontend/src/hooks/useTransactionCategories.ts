// src/hooks/useTransactionCategories.ts
// Delegates to CategoryContext — categories are fetched once at app level.
import { useCategories } from '../contexts/CategoryContext';
import { ApiError } from '../services/api/apiClient';
import { CategoryCreateDTO, CategoryUpdateDTO } from '../services/api/categoryService';
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
  const { categories, loading, error, createCategory, updateCategory, deleteCategory, refetch } =
    useCategories();

  return {
    categories,
    loading,
    error,
    fetchCategories: refetch,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
