// src/contexts/CategoryContext.tsx
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ApiError } from '../services/api/apiClient';
import {
  CategoryCreateDTO,
  CategoryUpdateDTO,
  categoryService,
} from '../services/api/categoryService';
import { TransactionCategory } from '../types/transaction.types';
import { useAuth } from './AuthContext';

interface CategoryContextType {
  categories: TransactionCategory[];
  loading: boolean;
  error: ApiError | null;
  createCategory: (data: CategoryCreateDTO) => Promise<TransactionCategory | null>;
  updateCategory: (data: CategoryUpdateDTO) => Promise<TransactionCategory | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const hasFetchedRef = useRef(false);

  const fetchCategories = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

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
  }, [isAuthenticated, authLoading]);

  // Fetch once on mount after auth is ready
  useEffect(() => {
    if (isAuthenticated && !authLoading && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchCategories();
    }
  }, [isAuthenticated, authLoading, fetchCategories]);

  const createCategory = async (data: CategoryCreateDTO): Promise<TransactionCategory | null> => {
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
    try {
      const response = await categoryService.update(data);
      setCategories((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...response.data } : c)));
      return response.data;
    } catch (err) {
      setError(err as ApiError);
      return null;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      await categoryService.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading: loading || authLoading,
        error,
        createCategory,
        updateCategory,
        deleteCategory,
        refetch: fetchCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCategories = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
