// src/contexts/GoalsContext.tsx
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { Goal, GoalStatus, GoalType } from '../types/goal.types';

interface GoalsContextType {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  getGoals: (type?: GoalType) => Promise<Goal[]>;
  getGoal: (id: string) => Promise<Goal | null>;
  createGoal: (goal: Omit<Goal, 'id'>) => Promise<Goal>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
  completeGoal: (id: string) => Promise<Goal>;
  pauseGoal: (id: string) => Promise<Goal>;
  resumeGoal: (id: string) => Promise<Goal>;
  getGoalProgress: (id: string) => { percentage: number; remaining: number };
  calculateProjectedCompletion: (id: string) => Date | null;
}

// Create context
const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

// Dummy goals data
const dummyGoals: Goal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    type: 'savings',
    targetAmount: 15000,
    currentAmount: 10000,
    startDate: '2024-01-01',
    targetDate: '2025-12-31',
    priority: 1,
    status: 'active',
    color: '#4CAF50',
    notes: 'Save 6 months of expenses for emergencies',
  },
  {
    id: '2',
    name: 'Vacation to Europe',
    type: 'savings',
    targetAmount: 5000,
    currentAmount: 2500,
    startDate: '2025-01-01',
    targetDate: '2025-08-15',
    priority: 2,
    status: 'active',
    color: '#2196F3',
    notes: 'Summer vacation to France and Italy',
  },
  {
    id: '3',
    name: 'New Car',
    type: 'major_purchase',
    targetAmount: 30000,
    currentAmount: 7500,
    startDate: '2024-06-01',
    targetDate: '2026-06-30',
    priority: 3,
    status: 'active',
    color: '#FFC107',
    contributionFrequency: 'monthly',
    contributionAmount: 1000,
  },
  {
    id: '4',
    name: 'Home Down Payment',
    type: 'major_purchase',
    targetAmount: 60000,
    currentAmount: 15000,
    startDate: '2023-01-01',
    targetDate: '2027-01-01',
    priority: 1,
    status: 'active',
    color: '#9C27B0',
    contributionFrequency: 'monthly',
    contributionAmount: 1200,
  },
  {
    id: '5',
    name: 'Pay off Student Loan',
    type: 'debt',
    targetAmount: 18000,
    currentAmount: 12000,
    startDate: '2023-05-01',
    targetDate: '2026-05-01',
    priority: 2,
    status: 'active',
    color: '#FF5722',
    contributionFrequency: 'monthly',
    contributionAmount: 500,
  },
];

export const GoalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        // Simulate API fetch with a delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setGoals(dummyGoals);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load goals data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Get all goals with optional type filter
  const getGoals = async (type?: GoalType): Promise<Goal[]> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      let filteredGoals = goals;

      if (type) {
        filteredGoals = goals.filter((goal) => goal.type === type);
      }

      setError(null);
      return filteredGoals;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get a single goal by ID
  const getGoal = async (id: string): Promise<Goal | null> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));

      const goal = goals.find((g) => g.id === id) || null;
      setError(null);
      return goal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goal');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new goal
  const createGoal = async (goal: Omit<Goal, 'id'>): Promise<Goal> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Generate a new ID (in a real app, this would be done by the backend)
      const newGoal: Goal = {
        ...goal,
        id: Date.now().toString(),
      };

      // Update state
      setGoals((prev) => [...prev, newGoal]);
      setError(null);

      return newGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
      throw new Error('Failed to create goal');
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing goal
  const updateGoal = async (id: string, goalData: Partial<Goal>): Promise<Goal> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Find and update the goal
      const updatedGoals = goals.map((g) => (g.id === id ? { ...g, ...goalData } : g));

      const updatedGoal = updatedGoals.find((g) => g.id === id);

      if (!updatedGoal) {
        throw new Error('Goal not found');
      }

      // Update state
      setGoals(updatedGoals);
      setError(null);

      return updatedGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      throw new Error('Failed to update goal');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a goal
  const deleteGoal = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Filter out the deleted goal
      const updatedGoals = goals.filter((g) => g.id !== id);

      // Update state
      setGoals(updatedGoals);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
      throw new Error('Failed to delete goal');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a goal as complete
  const completeGoal = async (id: string): Promise<Goal> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Find and update the goal
      const updatedGoals = goals.map((g) =>
        g.id === id
          ? {
              ...g,
              status: 'completed' as GoalStatus,
              currentAmount: g.targetAmount,
            }
          : g,
      );

      const updatedGoal = updatedGoals.find((g) => g.id === id);

      if (!updatedGoal) {
        throw new Error('Goal not found');
      }

      // Update state
      setGoals(updatedGoals);
      setError(null);

      return updatedGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete goal');
      throw new Error('Failed to complete goal');
    } finally {
      setIsLoading(false);
    }
  };

  // Pause a goal
  const pauseGoal = async (id: string): Promise<Goal> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Find and update the goal
      const updatedGoals = goals.map((g) =>
        g.id === id ? { ...g, status: 'paused' as GoalStatus } : g,
      );

      const updatedGoal = updatedGoals.find((g) => g.id === id);

      if (!updatedGoal) {
        throw new Error('Goal not found');
      }

      // Update state
      setGoals(updatedGoals);
      setError(null);

      return updatedGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause goal');
      throw new Error('Failed to pause goal');
    } finally {
      setIsLoading(false);
    }
  };

  // Continuing from the previous GoalsContext.tsx code
  // Resume a goal
  const resumeGoal = async (id: string): Promise<Goal> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Find and update the goal
      const updatedGoals = goals.map((g) =>
        g.id === id ? { ...g, status: 'active' as GoalStatus } : g,
      );

      const updatedGoal = updatedGoals.find((g) => g.id === id);

      if (!updatedGoal) {
        throw new Error('Goal not found');
      }

      // Update state
      setGoals(updatedGoals);
      setError(null);

      return updatedGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume goal');
      throw new Error('Failed to resume goal');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate goal progress (percentage and remaining amount)
  const getGoalProgress = (id: string) => {
    const goal = goals.find((g) => g.id === id);

    if (!goal) {
      return { percentage: 0, remaining: 0 };
    }

    const percentage = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
    const remaining = goal.targetAmount - goal.currentAmount;

    return { percentage, remaining };
  };

  // Calculate projected completion date based on contribution rate
  const calculateProjectedCompletion = (id: string): Date | null => {
    const goal = goals.find((g) => g.id === id);

    if (!goal || !goal.contributionAmount || !goal.contributionFrequency) {
      return null;
    }

    const remaining = goal.targetAmount - goal.currentAmount;

    if (remaining <= 0) {
      return new Date(); // Already completed
    }

    // Calculate monthly contribution based on frequency
    let monthlyContribution = 0;

    switch (goal.contributionFrequency) {
      case 'weekly':
        monthlyContribution = goal.contributionAmount * 4.33; // Average weeks per month
        break;
      case 'biweekly':
        monthlyContribution = goal.contributionAmount * 2.17; // Average bi-weeks per month
        break;
      case 'monthly':
        monthlyContribution = goal.contributionAmount;
        break;
      default:
        return null;
    }

    if (monthlyContribution <= 0) {
      return null;
    }

    // Calculate months needed to reach the target
    const monthsNeeded = Math.ceil(remaining / monthlyContribution);

    // Calculate projected completion date
    const today = new Date();
    const projectedDate = new Date(today);
    projectedDate.setMonth(today.getMonth() + monthsNeeded);

    return projectedDate;
  };

  const value = {
    goals,
    isLoading,
    error,
    getGoals,
    getGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    pauseGoal,
    resumeGoal,
    getGoalProgress,
    calculateProjectedCompletion,
  };

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
};

// Custom hook for using goals context
// eslint-disable-next-line react-refresh/only-export-components
export const useGoals = () => {
  const context = useContext(GoalsContext);

  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }

  return context;
};
