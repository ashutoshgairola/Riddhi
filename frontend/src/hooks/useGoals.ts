// src/hooks/useGoals.ts
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api/apiClient';
import goalService from '../services/api/goalService';
import { CreateGoalRequest, GetGoalsQuery, Goal, UpdateGoalRequest } from '../types/goal.types';

interface UseGoalsReturn {
  goals: Goal[];
  loading: boolean;
  error: ApiError | null;
  totalItems: number;
  fetchGoals: (query?: GetGoalsQuery) => Promise<void>;
  createGoal: (data: CreateGoalRequest) => Promise<Goal | null>;
  updateGoal: (id: string, data: UpdateGoalRequest) => Promise<Goal | null>;
  deleteGoal: (id: string) => Promise<boolean>;
  completeGoal: (id: string) => Promise<Goal | null>;
  pauseGoal: (id: string) => Promise<Goal | null>;
  resumeGoal: (id: string) => Promise<Goal | null>;
}

export const useGoals = (initialQuery?: GetGoalsQuery): UseGoalsReturn => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const hasInitializedRef = useRef(false);

  const fetchGoals = useCallback(
    async (query?: GetGoalsQuery) => {
      if (!isAuthenticated || authLoading) return;

      setLoading(true);
      setError(null);

      try {
        const response = await goalService.getAll(query);
        setGoals(response.data || []);
        setTotalItems(response.pagination?.total || 0);
      } catch (err) {
        setError(err as ApiError);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, authLoading],
  );

  useEffect(() => {
    if (isAuthenticated && !authLoading && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      fetchGoals(initialQuery);
    }
  }, [isAuthenticated, authLoading, fetchGoals, initialQuery]);

  const createGoal = async (data: CreateGoalRequest): Promise<Goal | null> => {
    setError(null);
    try {
      const newGoal = await goalService.create(data);
      setGoals((prev) => [newGoal, ...prev]);
      setTotalItems((prev) => prev + 1);
      return newGoal;
    } catch (err) {
      setError(err as ApiError);
      return null;
    }
  };

  const updateGoal = async (id: string, data: UpdateGoalRequest): Promise<Goal | null> => {
    setError(null);
    try {
      const updated = await goalService.update(id, data);
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      return updated;
    } catch (err) {
      setError(err as ApiError);
      return null;
    }
  };

  const deleteGoal = async (id: string): Promise<boolean> => {
    setError(null);
    try {
      await goalService.delete(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      setTotalItems((prev) => prev - 1);
      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    }
  };

  const completeGoal = async (id: string): Promise<Goal | null> => {
    setError(null);
    try {
      const updated = await goalService.complete(id);
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      return updated;
    } catch (err) {
      setError(err as ApiError);
      return null;
    }
  };

  const pauseGoal = async (id: string): Promise<Goal | null> => {
    setError(null);
    try {
      const updated = await goalService.pause(id);
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      return updated;
    } catch (err) {
      setError(err as ApiError);
      return null;
    }
  };

  const resumeGoal = async (id: string): Promise<Goal | null> => {
    setError(null);
    try {
      const updated = await goalService.resume(id);
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      return updated;
    } catch (err) {
      setError(err as ApiError);
      return null;
    }
  };

  return {
    goals,
    loading,
    error,
    totalItems,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    pauseGoal,
    resumeGoal,
  };
};
