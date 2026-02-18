// src/contexts/TransactionContext.tsx
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { Transaction, TransactionCategory, TransactionFilters } from '../types/transaction.types';

interface TransactionContextType {
  transactions: Transaction[];
  categories: TransactionCategory[];
  isLoading: boolean;
  error: string | null;
  getTransactions: (filters?: TransactionFilters) => Promise<Transaction[]>;
  getTransaction: (id: string) => Promise<Transaction | null>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  getCategories: () => Promise<TransactionCategory[]>;
  addCategory: (category: Omit<TransactionCategory, 'id'>) => Promise<TransactionCategory>;
  updateCategory: (
    id: string,
    category: Partial<TransactionCategory>,
  ) => Promise<TransactionCategory>;
  deleteCategory: (id: string) => Promise<void>;
}

// Create context
const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Dummy data for transactions
const dummyTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-04-22',
    description: 'Grocery Store',
    amount: 89.24,
    type: 'expense',
    categoryId: '1',
    accountId: '1',
    status: 'cleared',
    tags: ['food', 'groceries'],
  },
  {
    id: '2',
    date: '2025-04-21',
    description: 'Monthly Salary',
    amount: 5000,
    type: 'income',
    categoryId: '2',
    accountId: '1',
    status: 'cleared',
    tags: ['salary', 'income'],
  },
  {
    id: '3',
    date: '2025-04-20',
    description: 'Restaurant',
    amount: 64.5,
    type: 'expense',
    categoryId: '3',
    accountId: '1',
    status: 'cleared',
    tags: ['food', 'dining out'],
  },
  {
    id: '4',
    date: '2025-04-18',
    description: 'Electricity Bill',
    amount: 110.33,
    type: 'expense',
    categoryId: '4',
    accountId: '1',
    status: 'cleared',
    tags: ['utilities', 'bills'],
  },
  {
    id: '5',
    date: '2025-04-15',
    description: 'Gym Membership',
    amount: 49.99,
    type: 'expense',
    categoryId: '5',
    accountId: '2',
    status: 'cleared',
    tags: ['fitness', 'subscriptions'],
  },
  {
    id: '6',
    date: '2025-04-14',
    description: 'Client Payment',
    amount: 1200,
    type: 'income',
    categoryId: '6',
    accountId: '1',
    status: 'cleared',
    tags: ['freelance', 'income'],
  },
  {
    id: '7',
    date: '2025-04-10',
    description: 'Internet Bill',
    amount: 75.0,
    type: 'expense',
    categoryId: '4',
    accountId: '1',
    status: 'cleared',
    tags: ['utilities', 'bills'],
  },
  {
    id: '8',
    date: '2025-04-05',
    description: 'Movie Tickets',
    amount: 32.5,
    type: 'expense',
    categoryId: '7',
    accountId: '2',
    status: 'cleared',
    tags: ['entertainment'],
  },
  {
    id: '9',
    date: '2025-04-03',
    description: 'Clothing Store',
    amount: 128.75,
    type: 'expense',
    categoryId: '8',
    accountId: '2',
    status: 'cleared',
    tags: ['shopping', 'clothing'],
  },
  {
    id: '10',
    date: '2025-04-01',
    description: 'Rent Payment',
    amount: 1500,
    type: 'expense',
    categoryId: '1',
    accountId: '1',
    status: 'cleared',
    tags: ['housing', 'bills'],
  },
];

// Dummy data for categories
const dummyCategories: TransactionCategory[] = [
  { id: '1', name: 'Housing', color: '#4CAF50', icon: 'home' },
  { id: '2', name: 'Income', color: '#2196F3', icon: 'dollar-sign' },
  { id: '3', name: 'Dining', color: '#FFC107', icon: 'utensils' },
  { id: '4', name: 'Utilities', color: '#FF5722', icon: 'bolt' },
  { id: '5', name: 'Fitness', color: '#9C27B0', icon: 'dumbbell' },
  { id: '6', name: 'Freelance', color: '#3F51B5', icon: 'briefcase' },
  { id: '7', name: 'Entertainment', color: '#E91E63', icon: 'film' },
  { id: '8', name: 'Shopping', color: '#607D8B', icon: 'shopping-bag' },
];

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        // Simulate API fetch with a delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setTransactions(dummyTransactions);
        setCategories(dummyCategories);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transaction data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Get transactions with optional filters
  const getTransactions = async (filters?: TransactionFilters): Promise<Transaction[]> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Filter transactions based on provided filters
      let filteredTransactions = [...dummyTransactions];

      if (filters) {
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          filteredTransactions = filteredTransactions.filter((t) =>
            t.description.toLowerCase().includes(term),
          );
        }

        if (filters.types && filters.types.length > 0) {
          filteredTransactions = filteredTransactions.filter((t) =>
            filters.types!.includes(t.type),
          );
        }

        if (filters.startDate) {
          filteredTransactions = filteredTransactions.filter(
            (t) => new Date(t.date) >= new Date(filters.startDate!),
          );
        }

        if (filters.endDate) {
          filteredTransactions = filteredTransactions.filter(
            (t) => new Date(t.date) <= new Date(filters.endDate!),
          );
        }

        if (filters.categoryIds && filters.categoryIds.length > 0) {
          filteredTransactions = filteredTransactions.filter((t) =>
            filters.categoryIds!.includes(t.categoryId),
          );
        }

        if (filters.accountIds && filters.accountIds.length > 0) {
          filteredTransactions = filteredTransactions.filter((t) =>
            filters.accountIds!.includes(t.accountId),
          );
        }

        if (filters.minAmount !== undefined) {
          filteredTransactions = filteredTransactions.filter((t) => t.amount >= filters.minAmount!);
        }

        if (filters.maxAmount !== undefined) {
          filteredTransactions = filteredTransactions.filter((t) => t.amount <= filters.maxAmount!);
        }

        if (filters.tags && filters.tags.length > 0) {
          filteredTransactions = filteredTransactions.filter(
            (t) => t.tags && filters.tags!.some((tag) => t.tags!.includes(tag)),
          );
        }

        if (filters.status && filters.status.length > 0) {
          filteredTransactions = filteredTransactions.filter((t) =>
            filters.status!.includes(t.status),
          );
        }
      }

      // Update state with filtered transactions
      setTransactions(filteredTransactions);
      setError(null);

      return filteredTransactions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get a single transaction by ID
  const getTransaction = async (id: string): Promise<Transaction | null> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));

      const transaction = transactions.find((t) => t.id === id) || null;
      setError(null);
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new transaction
  const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Generate a new ID (in a real app, this would be done by the backend)
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
      };

      // Update state
      setTransactions((prev) => [...prev, newTransaction]);
      setError(null);

      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw new Error('Failed to add transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing transaction
  const updateTransaction = async (
    id: string,
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Find and update the transaction
      const updatedTransactions = transactions.map((t) =>
        t.id === id ? { ...t, ...transactionData } : t,
      );

      const updatedTransaction = updatedTransactions.find((t) => t.id === id);

      if (!updatedTransaction) {
        throw new Error('Transaction not found');
      }

      // Update state
      setTransactions(updatedTransactions);
      setError(null);

      return updatedTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw new Error('Failed to update transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Filter out the deleted transaction
      const updatedTransactions = transactions.filter((t) => t.id !== id);

      // Update state
      setTransactions(updatedTransactions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw new Error('Failed to delete transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Get all categories
  const getCategories = async (): Promise<TransactionCategory[]> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));

      setError(null);
      return categories;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new category
  const addCategory = async (
    category: Omit<TransactionCategory, 'id'>,
  ): Promise<TransactionCategory> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Generate a new ID (in a real app, this would be done by the backend)
      const newCategory: TransactionCategory = {
        ...category,
        id: Date.now().toString(),
      };

      // Update state
      setCategories((prev) => [...prev, newCategory]);
      setError(null);

      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
      throw new Error('Failed to add category');
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing category
  const updateCategory = async (
    id: string,
    categoryData: Partial<TransactionCategory>,
  ): Promise<TransactionCategory> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Find and update the category
      const updatedCategories = categories.map((c) =>
        c.id === id ? { ...c, ...categoryData } : c,
      );

      const updatedCategory = updatedCategories.find((c) => c.id === id);

      if (!updatedCategory) {
        throw new Error('Category not found');
      }

      // Update state
      setCategories(updatedCategories);
      setError(null);

      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw new Error('Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a category
  const deleteCategory = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Filter out the deleted category
      const updatedCategories = categories.filter((c) => c.id !== id);

      // Update state
      setCategories(updatedCategories);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw new Error('Failed to delete category');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    transactions,
    categories,
    isLoading,
    error,
    getTransactions,
    getTransaction,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};

// Custom hook for using transaction context
// eslint-disable-next-line react-refresh/only-export-components
export const useTransactions = () => {
  const context = useContext(TransactionContext);

  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }

  return context;
};
