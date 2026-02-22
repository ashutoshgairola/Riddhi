// src/hooks/useInvestments.ts
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api/apiClient';
import investmentService from '../services/api/investmentService';
import {
  AssetAllocation,
  CreateInvestmentRequest,
  GetInvestmentsQuery,
  Investment,
  PortfolioPerformancePoint,
  PortfolioSummary,
  UpdateInvestmentRequest,
} from '../types/investment.types';

interface UseInvestmentsReturn {
  investments: Investment[];
  portfolioSummary: PortfolioSummary | null;
  allocations: AssetAllocation[];
  performance: PortfolioPerformancePoint[];
  loading: boolean;
  error: ApiError | null;
  totalItems: number;
  fetchInvestments: (query?: GetInvestmentsQuery) => Promise<void>;
  createInvestment: (data: CreateInvestmentRequest) => Promise<Investment | null>;
  updateInvestment: (id: string, data: UpdateInvestmentRequest) => Promise<Investment | null>;
  deleteInvestment: (id: string) => Promise<boolean>;
}

export const useInvestments = (initialQuery?: GetInvestmentsQuery): UseInvestmentsReturn => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
  const [performance, setPerformance] = useState<PortfolioPerformancePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const hasInitializedRef = useRef(false);

  const fetchInvestments = useCallback(
    async (query?: GetInvestmentsQuery) => {
      if (!isAuthenticated || authLoading) return;

      setLoading(true);
      setError(null);

      try {
        const [listRes, summaryRes, allocationRes, performanceRes] = await Promise.all([
          investmentService.getAll(query),
          investmentService.getPortfolioSummary(),
          investmentService.getPortfolioAllocation(),
          investmentService.getPortfolioPerformance(),
        ]);

        setInvestments(listRes.data.items ?? []);
        setTotalItems(listRes.data.total ?? 0);
        setPortfolioSummary(summaryRes.data);
        setAllocations(allocationRes.data.allocations ?? []);
        setPerformance(performanceRes.data.performance ?? []);
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
      fetchInvestments(initialQuery);
    }
  }, [isAuthenticated, authLoading, fetchInvestments, initialQuery]);

  const createInvestment = async (data: CreateInvestmentRequest): Promise<Investment | null> => {
    setError(null);
    try {
      const res = await investmentService.create(data);
      setInvestments((prev) => [res.data, ...prev]);
      setTotalItems((prev) => prev + 1);
      // Refresh analytics after mutation
      void fetchInvestments(initialQuery);
      return res.data;
    } catch (err) {
      setError(err as ApiError);
      return null;
    }
  };

  const updateInvestment = async (
    id: string,
    data: UpdateInvestmentRequest,
  ): Promise<Investment | null> => {
    setError(null);
    try {
      const res = await investmentService.update(id, data);
      setInvestments((prev) => prev.map((inv) => (inv.id === id ? res.data : inv)));
      void fetchInvestments(initialQuery);
      return res.data;
    } catch (err) {
      setError(err as ApiError);
      return null;
    }
  };

  const deleteInvestment = async (id: string): Promise<boolean> => {
    setError(null);
    try {
      await investmentService.remove(id);
      setInvestments((prev) => prev.filter((inv) => inv.id !== id));
      setTotalItems((prev) => prev - 1);
      void fetchInvestments(initialQuery);
      return true;
    } catch (err) {
      setError(err as ApiError);
      return false;
    }
  };

  return {
    investments,
    portfolioSummary,
    allocations,
    performance,
    loading: loading || authLoading,
    error,
    totalItems,
    fetchInvestments,
    createInvestment,
    updateInvestment,
    deleteInvestment,
  };
};
