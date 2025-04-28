// src/contexts/BudgetContext.tsx
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { Budget, BudgetCategory } from '../types/budget.types';

interface BudgetContextType {
  currentBudget: Budget | null;
  budgetHistory: Budget[];
  isLoading: boolean;
  error: string | null;
  getCurrentBudget: () => Promise<Budget | null>;
  getBudgetHistory: () => Promise<Budget[]>;
  createBudget: (budget: Omit<Budget, 'id'>) => Promise<Budget>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  addBudgetCategory: (
    budgetId: string,
    category: Omit<BudgetCategory, 'id'>,
  ) => Promise<BudgetCategory>;
  updateBudgetCategory: (
    budgetId: string,
    categoryId: string,
    category: Partial<BudgetCategory>,
  ) => Promise<BudgetCategory>;
  deleteBudgetCategory: (budgetId: string, categoryId: string) => Promise<void>;
}

// Create context
const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// Continue from previous snippet of BudgetContext.tsx
const dummyBudgetHistory: Budget[] = [
  {
    id: '2025-03',
    name: 'March 2025',
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    categories: [
      {
        id: '1',
        name: 'Housing',
        allocated: 1500,
        spent: 1500,
        categoryId: '1',
        color: '#4CAF50',
      },
      {
        id: '2',
        name: 'Food',
        allocated: 600,
        spent: 550,
        categoryId: '2',
        color: '#2196F3',
      },
      {
        id: '3',
        name: 'Transport',
        allocated: 300,
        spent: 320,
        categoryId: '3',
        color: '#FFC107',
      },
      {
        id: '4',
        name: 'Entertainment',
        allocated: 400,
        spent: 450,
        categoryId: '4',
        color: '#9C27B0',
      },
      {
        id: '5',
        name: 'Utilities',
        allocated: 350,
        spent: 340,
        categoryId: '5',
        color: '#FF5722',
      },
      {
        id: '6',
        name: 'Shopping',
        allocated: 250,
        spent: 300,
        categoryId: '6',
        color: '#607D8B',
      },
      {
        id: '7',
        name: 'Health',
        allocated: 200,
        spent: 180,
        categoryId: '7',
        color: '#795548',
      },
      {
        id: '8',
        name: 'Personal Care',
        allocated: 150,
        spent: 160,
        categoryId: '8',
        color: '#009688',
      },
    ],
    totalAllocated: 3750,
    totalSpent: 3800,
    income: 5000,
  },
  {
    id: '2025-02',
    name: 'February 2025',
    startDate: '2025-02-01',
    endDate: '2025-02-28',
    categories: [
      {
        id: '1',
        name: 'Housing',
        allocated: 1500,
        spent: 1500,
        categoryId: '1',
        color: '#4CAF50',
      },
      {
        id: '2',
        name: 'Food',
        allocated: 600,
        spent: 580,
        categoryId: '2',
        color: '#2196F3',
      },
      {
        id: '3',
        name: 'Transport',
        allocated: 300,
        spent: 290,
        categoryId: '3',
        color: '#FFC107',
      },
      {
        id: '4',
        name: 'Entertainment',
        allocated: 400,
        spent: 380,
        categoryId: '4',
        color: '#9C27B0',
      },
      {
        id: '5',
        name: 'Utilities',
        allocated: 350,
        spent: 360,
        categoryId: '5',
        color: '#FF5722',
      },
      {
        id: '6',
        name: 'Shopping',
        allocated: 250,
        spent: 230,
        categoryId: '6',
        color: '#607D8B',
      },
      {
        id: '7',
        name: 'Health',
        allocated: 200,
        spent: 150,
        categoryId: '7',
        color: '#795548',
      },
      {
        id: '8',
        name: 'Personal Care',
        allocated: 150,
        spent: 120,
        categoryId: '8',
        color: '#009688',
      },
    ],
    totalAllocated: 3750,
    totalSpent: 3610,
    income: 4800,
  },
  {
    id: '2025-01',
    name: 'January 2025',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    categories: [
      {
        id: '1',
        name: 'Housing',
        allocated: 1500,
        spent: 1500,
        categoryId: '1',
        color: '#4CAF50',
      },
      {
        id: '2',
        name: 'Food',
        allocated: 600,
        spent: 620,
        categoryId: '2',
        color: '#2196F3',
      },
      {
        id: '3',
        name: 'Transport',
        allocated: 300,
        spent: 280,
        categoryId: '3',
        color: '#FFC107',
      },
      {
        id: '4',
        name: 'Entertainment',
        allocated: 400,
        spent: 420,
        categoryId: '4',
        color: '#9C27B0',
      },
      {
        id: '5',
        name: 'Utilities',
        allocated: 350,
        spent: 380,
        categoryId: '5',
        color: '#FF5722',
      },
      {
        id: '6',
        name: 'Shopping',
        allocated: 250,
        spent: 270,
        categoryId: '6',
        color: '#607D8B',
      },
      {
        id: '7',
        name: 'Health',
        allocated: 200,
        spent: 190,
        categoryId: '7',
        color: '#795548',
      },
      {
        id: '8',
        name: 'Personal Care',
        allocated: 150,
        spent: 130,
        categoryId: '8',
        color: '#009688',
      },
    ],
    totalAllocated: 3750,
    totalSpent: 3790,
    income: 4800,
  },
];

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [budgetHistory, setBudgetHistory] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        // Simulate API fetch with a delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const dummyCurrentBudget: Budget = dummyBudgetHistory[0];
        setCurrentBudget(dummyCurrentBudget);
        setBudgetHistory(dummyBudgetHistory);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load budget data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Get current budget
  const getCurrentBudget = async (): Promise<Budget | null> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));

      setError(null);
      return currentBudget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch current budget');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get budget history
  const getBudgetHistory = async (): Promise<Budget[]> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      setError(null);
      return budgetHistory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budget history');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new budget
  const createBudget = async (budget: Omit<Budget, 'id'>): Promise<Budget> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Generate a new ID (in a real app, this would be done by the backend)
      const newBudget: Budget = {
        ...budget,
        id: Date.now().toString(),
      };

      // If this is a current month budget, update currentBudget
      const today = new Date();
      const budgetStart = new Date(budget.startDate);
      const budgetEnd = new Date(budget.endDate);

      if (today >= budgetStart && today <= budgetEnd) {
        setCurrentBudget(newBudget);
      } else {
        // Otherwise add to history
        setBudgetHistory((prev) => [...prev, newBudget]);
      }

      setError(null);
      return newBudget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create budget');
      throw new Error('Failed to create budget');
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing budget
  const updateBudget = async (id: string, budgetData: Partial<Budget>): Promise<Budget> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Check if updating current budget
      if (currentBudget && currentBudget.id === id) {
        const updatedBudget = { ...currentBudget, ...budgetData };

        // Recalculate totals if categories were updated
        if (budgetData.categories) {
          updatedBudget.totalAllocated = budgetData.categories.reduce(
            (sum, category) => sum + category.allocated,
            0,
          );
          updatedBudget.totalSpent = budgetData.categories.reduce(
            (sum, category) => sum + category.spent,
            0,
          );
        }

        setCurrentBudget(updatedBudget);
        setError(null);
        return updatedBudget;
      }

      // Otherwise update budget in history
      const updatedHistory = budgetHistory.map((budget) => {
        if (budget.id === id) {
          const updatedBudget = { ...budget, ...budgetData };

          // Recalculate totals if categories were updated
          if (budgetData.categories) {
            updatedBudget.totalAllocated = budgetData.categories.reduce(
              (sum, category) => sum + category.allocated,
              0,
            );
            updatedBudget.totalSpent = budgetData.categories.reduce(
              (sum, category) => sum + category.spent,
              0,
            );
          }

          return updatedBudget;
        }
        return budget;
      });

      const updatedBudget = updatedHistory.find((budget) => budget.id === id);

      if (!updatedBudget) {
        throw new Error('Budget not found');
      }

      setBudgetHistory(updatedHistory);
      setError(null);
      return updatedBudget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget');
      throw new Error('Failed to update budget');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a budget
  const deleteBudget = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if deleting current budget
      if (currentBudget && currentBudget.id === id) {
        setCurrentBudget(null);
      } else {
        // Otherwise remove from history
        const updatedHistory = budgetHistory.filter((budget) => budget.id !== id);
        setBudgetHistory(updatedHistory);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget');
      throw new Error('Failed to delete budget');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a category to a budget
  const addBudgetCategory = async (
    budgetId: string,
    category: Omit<BudgetCategory, 'id'>,
  ): Promise<BudgetCategory> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Generate a new ID (in a real app, this would be done by the backend)
      const newCategory: BudgetCategory = {
        ...category,
        id: Date.now().toString(),
      };

      // Check if adding to current budget
      if (currentBudget && currentBudget.id === budgetId) {
        const updatedCategories = [...currentBudget.categories, newCategory];
        const totalAllocated = updatedCategories.reduce((sum, cat) => sum + cat.allocated, 0);
        const totalSpent = updatedCategories.reduce((sum, cat) => sum + cat.spent, 0);

        setCurrentBudget({
          ...currentBudget,
          categories: updatedCategories,
          totalAllocated,
          totalSpent,
        });
      } else {
        // Otherwise add to a budget in history
        const updatedHistory = budgetHistory.map((budget) => {
          if (budget.id === budgetId) {
            const updatedCategories = [...budget.categories, newCategory];
            const totalAllocated = updatedCategories.reduce((sum, cat) => sum + cat.allocated, 0);
            const totalSpent = updatedCategories.reduce((sum, cat) => sum + cat.spent, 0);

            return {
              ...budget,
              categories: updatedCategories,
              totalAllocated,
              totalSpent,
            };
          }
          return budget;
        });

        setBudgetHistory(updatedHistory);
      }

      setError(null);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add budget category');
      throw new Error('Failed to add budget category');
    } finally {
      setIsLoading(false);
    }
  };

  // Update a budget category
  const updateBudgetCategory = async (
    budgetId: string,
    categoryId: string,
    categoryData: Partial<BudgetCategory>,
  ): Promise<BudgetCategory> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if updating in current budget
      if (currentBudget && currentBudget.id === budgetId) {
        const updatedCategories = currentBudget.categories.map((category) => {
          if (category.id === categoryId) {
            return { ...category, ...categoryData };
          }
          return category;
        });

        const updatedCategory = updatedCategories.find((category) => category.id === categoryId);

        if (!updatedCategory) {
          throw new Error('Category not found');
        }

        const totalAllocated = updatedCategories.reduce((sum, cat) => sum + cat.allocated, 0);
        const totalSpent = updatedCategories.reduce((sum, cat) => sum + cat.spent, 0);

        setCurrentBudget({
          ...currentBudget,
          categories: updatedCategories,
          totalAllocated,
          totalSpent,
        });

        setError(null);
        return updatedCategory;
      } else {
        // Otherwise update in a budget in history
        let updatedCategory: BudgetCategory | undefined;

        const updatedHistory = budgetHistory.map((budget) => {
          if (budget.id === budgetId) {
            const updatedCategories = budget.categories.map((category) => {
              if (category.id === categoryId) {
                const updated = { ...category, ...categoryData };
                updatedCategory = updated;
                return updated;
              }
              return category;
            });

            const totalAllocated = updatedCategories.reduce((sum, cat) => sum + cat.allocated, 0);
            const totalSpent = updatedCategories.reduce((sum, cat) => sum + cat.spent, 0);

            return {
              ...budget,
              categories: updatedCategories,
              totalAllocated,
              totalSpent,
            };
          }
          return budget;
        });

        if (!updatedCategory) {
          throw new Error('Category not found');
        }

        setBudgetHistory(updatedHistory);
        setError(null);
        return updatedCategory;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget category');
      throw new Error('Failed to update budget category');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a budget category
  const deleteBudgetCategory = async (budgetId: string, categoryId: string): Promise<void> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if deleting from current budget
      if (currentBudget && currentBudget.id === budgetId) {
        const updatedCategories = currentBudget.categories.filter(
          (category) => category.id !== categoryId,
        );

        const totalAllocated = updatedCategories.reduce((sum, cat) => sum + cat.allocated, 0);
        const totalSpent = updatedCategories.reduce((sum, cat) => sum + cat.spent, 0);

        setCurrentBudget({
          ...currentBudget,
          categories: updatedCategories,
          totalAllocated,
          totalSpent,
        });
      } else {
        // Otherwise delete from a budget in history
        const updatedHistory = budgetHistory.map((budget) => {
          if (budget.id === budgetId) {
            const updatedCategories = budget.categories.filter(
              (category) => category.id !== categoryId,
            );

            const totalAllocated = updatedCategories.reduce((sum, cat) => sum + cat.allocated, 0);
            const totalSpent = updatedCategories.reduce((sum, cat) => sum + cat.spent, 0);

            return {
              ...budget,
              categories: updatedCategories,
              totalAllocated,
              totalSpent,
            };
          }
          return budget;
        });

        setBudgetHistory(updatedHistory);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget category');
      throw new Error('Failed to delete budget category');
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
export const useBudgets = () => {
  const context = useContext(BudgetContext);

  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }

  return context;
};
