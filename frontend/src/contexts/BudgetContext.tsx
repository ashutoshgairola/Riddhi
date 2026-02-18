// src/contexts/BudgetContext.tsx (updated)
import React, { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';

import { ApiError } from '../services/api/apiClient';
import budgetService from '../services/api/budgetService';
import {
  Budget,
  BudgetCategory,
  BudgetCreateDTO,
  BudgetFilters,
  BudgetUpdateDTO,
} from '../types/budget.types';
import { useAuth } from './AuthContext';

interface BudgetContextType {
  currentBudget: Budget | null;
  budgetHistory: Budget[];
  isLoading: boolean;
  error: ApiError | null;
  getCurrentBudget: () => Promise<Budget | null>;
  getBudgetHistory: (filters?: BudgetFilters) => Promise<Budget[]>;
  getBudgetById: (id: string) => Promise<Budget | null>;
  createBudget: (data: BudgetCreateDTO) => Promise<Budget | null>;
  updateBudget: (id: string, data: BudgetUpdateDTO) => Promise<Budget | null>;
  deleteBudget: (id: string) => Promise<boolean>;
  addBudgetCategory: (
    budgetId: string,
    category: Omit<BudgetCategory, 'id' | 'spent'>,
  ) => Promise<BudgetCategory | null>;
  updateBudgetCategory: (
    budgetId: string,
    categoryId: string,
    category: Partial<BudgetCategory>,
  ) => Promise<BudgetCategory | null>;
  deleteBudgetCategory: (budgetId: string, categoryId: string) => Promise<boolean>;
}

// Create context
const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [budgetHistory, setBudgetHistory] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Get auth context to check authentication status
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Refs to track loading status
  const hasLoadedCurrentRef = useRef(false);
  const hasLoadedHistoryRef = useRef(false);

  // Load current budget and history after authentication is confirmed
  useEffect(() => {
    // Only fetch data if authenticated and auth check is complete
    if (isAuthenticated && !authLoading) {
      const loadInitialData = async () => {
        // Load current budget if not already loaded
        if (!hasLoadedCurrentRef.current) {
          setIsLoading(true);
          try {
            const response = await budgetService.getCurrentBudget();
            setCurrentBudget(response.data);
            hasLoadedCurrentRef.current = true;
            setError(null);
          } catch (err) {
            console.error('Error loading current budget:', err);
            setError(err as ApiError);
          } finally {
            setIsLoading(false);
          }
        }

        // Load budget history if not already loaded
        if (!hasLoadedHistoryRef.current) {
          setIsLoading(true);
          try {
            const response = await budgetService.getBudgetHistory();
            setBudgetHistory(response.data.items || []);
            hasLoadedHistoryRef.current = true;
            setError(null);
          } catch (err) {
            console.error('Error loading budget history:', err);
            setError(err as ApiError);
          } finally {
            setIsLoading(false);
          }
        }
      };

      loadInitialData();
    }
  }, [isAuthenticated, authLoading]);

  // Get current budget
  const getCurrentBudget = async (): Promise<Budget | null> => {
    if (!isAuthenticated) return null;

    try {
      setIsLoading(true);
      const response = await budgetService.getCurrentBudget();
      const budget = response.data;
      setCurrentBudget(budget);
      setError(null);
      return budget;
    } catch (err) {
      setError(err as ApiError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get budget history with optional filters
  const getBudgetHistory = async (filters?: BudgetFilters): Promise<Budget[]> => {
    if (!isAuthenticated) return [];

    try {
      setIsLoading(true);
      const response = await budgetService.getBudgetHistory(filters);
      const budgets = response.data.items;
      setBudgetHistory(budgets);
      setError(null);
      return budgets;
    } catch (err) {
      setError(err as ApiError);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get budget by ID
  const getBudgetById = async (id: string): Promise<Budget | null> => {
    if (!isAuthenticated) return null;

    try {
      setIsLoading(true);
      const response = await budgetService.getBudgetById(id);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err as ApiError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new budget
  const createBudget = async (data: BudgetCreateDTO): Promise<Budget | null> => {
    if (!isAuthenticated) return null;

    try {
      setIsLoading(true);
      const response = await budgetService.createBudget(data);
      const newBudget = response.data;

      // If this is a current month budget, update currentBudget
      const today = new Date();
      const budgetStart = new Date(data.startDate);
      const budgetEnd = new Date(data.endDate);

      if (today >= budgetStart && today <= budgetEnd) {
        setCurrentBudget(newBudget);
      } else {
        // Otherwise add to history
        setBudgetHistory((prev) => [newBudget, ...prev]);
      }

      setError(null);
      return newBudget;
    } catch (err) {
      setError(err as ApiError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing budget
  const updateBudget = async (id: string, data: BudgetUpdateDTO): Promise<Budget | null> => {
    if (!isAuthenticated) return null;

    try {
      setIsLoading(true);
      const response = await budgetService.updateBudget(id, data);
      const updatedBudget = response.data;

      // Update either current budget or history
      if (currentBudget && currentBudget.id === id) {
        setCurrentBudget(updatedBudget);
      } else {
        setBudgetHistory((prev) =>
          prev.map((budget) => (budget.id === id ? updatedBudget : budget)),
        );
      }

      setError(null);
      return updatedBudget;
    } catch (err) {
      setError(err as ApiError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a budget
  const deleteBudget = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setIsLoading(true);
      await budgetService.deleteBudget(id);

      // Update either current budget or history
      if (currentBudget && currentBudget.id === id) {
        setCurrentBudget(null);
      } else {
        setBudgetHistory((prev) => prev.filter((budget) => budget.id !== id));
      }

      setError(null);
      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a category to a budget
  const addBudgetCategory = async (
    budgetId: string,
    category: Omit<BudgetCategory, 'id' | 'spent'>,
  ): Promise<BudgetCategory | null> => {
    if (!isAuthenticated) return null;

    try {
      setIsLoading(true);
      const response = await budgetService.createBudgetCategory(budgetId, category);
      const newCategory = response.data;

      // After adding a category, refetch the budget to get updated totals
      if (currentBudget && currentBudget.id === budgetId) {
        getCurrentBudget();
      } else {
        // Force refresh of any budget in history that was updated
        getBudgetById(budgetId).then((updatedBudget) => {
          if (updatedBudget) {
            setBudgetHistory((prev) =>
              prev.map((budget) => (budget.id === budgetId ? updatedBudget : budget)),
            );
          }
        });
      }

      setError(null);
      return newCategory;
    } catch (err) {
      setError(err as ApiError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a budget category
  const updateBudgetCategory = async (
    budgetId: string,
    categoryId: string,
    categoryData: Partial<BudgetCategory>,
  ): Promise<BudgetCategory | null> => {
    if (!isAuthenticated) return null;

    try {
      setIsLoading(true);
      const response = await budgetService.updateBudgetCategory(budgetId, categoryId, categoryData);
      const updatedCategory = response.data;

      // After updating a category, refetch the budget to get updated totals
      if (currentBudget && currentBudget.id === budgetId) {
        getCurrentBudget();
      } else {
        // Force refresh of any budget in history that was updated
        getBudgetById(budgetId).then((updatedBudget) => {
          if (updatedBudget) {
            setBudgetHistory((prev) =>
              prev.map((budget) => (budget.id === budgetId ? updatedBudget : budget)),
            );
          }
        });
      }

      setError(null);
      return updatedCategory;
    } catch (err) {
      setError(err as ApiError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a budget category
  const deleteBudgetCategory = async (budgetId: string, categoryId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setIsLoading(true);
      await budgetService.deleteBudgetCategory(budgetId, categoryId);

      // After deleting a category, refetch the budget to get updated totals
      if (currentBudget && currentBudget.id === budgetId) {
        getCurrentBudget();
      } else {
        // Force refresh of any budget in history that was updated
        getBudgetById(budgetId).then((updatedBudget) => {
          if (updatedBudget) {
            setBudgetHistory((prev) =>
              prev.map((budget) => (budget.id === budgetId ? updatedBudget : budget)),
            );
          }
        });
      }

      setError(null);
      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentBudget,
    budgetHistory,
    isLoading,
    error,
    getCurrentBudget,
    getBudgetHistory,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};

// Custom hook for using budget context
// eslint-disable-next-line react-refresh/only-export-components
export const useBudgets = () => {
  const context = useContext(BudgetContext);

  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }

  return context;
};
