// src/hooks/useReports.ts
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api/apiClient';
import reportService from '../services/api/reportService';
import {
  AccountSummaryResponse,
  BudgetPerformanceResponse,
  IncomeExpenseQuery,
  IncomeExpenseResponse,
  NetWorthPeriod,
  NetWorthResponse,
  ReportTimeframe,
} from '../types/report.types';

interface UseReportsReturn {
  incomeExpense: IncomeExpenseResponse | null;
  accountSummary: AccountSummaryResponse | null;
  netWorth: NetWorthResponse | null;
  budgetPerformance: BudgetPerformanceResponse | null;
  loading: boolean;
  error: ApiError | null;
  fetchIncomeExpense: (
    period: ReportTimeframe,
    startDate?: string,
    endDate?: string,
  ) => Promise<void>;
  fetchAccountSummary: (startDate?: string, endDate?: string) => Promise<void>;
  fetchNetWorth: (period: NetWorthPeriod) => Promise<void>;
  fetchBudgetPerformance: (budgetId?: string) => Promise<void>;
}

export const useReports = (): UseReportsReturn => {
  const [incomeExpense, setIncomeExpense] = useState<IncomeExpenseResponse | null>(null);
  const [accountSummary, setAccountSummary] = useState<AccountSummaryResponse | null>(null);
  const [netWorth, setNetWorth] = useState<NetWorthResponse | null>(null);
  const [budgetPerformance, setBudgetPerformance] = useState<BudgetPerformanceResponse | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const hasInitializedRef = useRef(false);

  const fetchIncomeExpense = useCallback(
    async (period: ReportTimeframe, startDate?: string, endDate?: string): Promise<void> => {
      if (!isAuthenticated) return;
      const query: IncomeExpenseQuery = { period, startDate, endDate };
      try {
        const data = await reportService.getIncomeExpenseSummary(query);
        setIncomeExpense(data);
      } catch (err) {
        setError(err as ApiError);
      }
    },
    [isAuthenticated],
  );

  const fetchAccountSummary = useCallback(
    async (startDate?: string, endDate?: string): Promise<void> => {
      if (!isAuthenticated) return;
      try {
        const data = await reportService.getAccountSummary({ startDate, endDate });
        setAccountSummary(data);
      } catch (err) {
        setError(err as ApiError);
      }
    },
    [isAuthenticated],
  );

  const fetchNetWorth = useCallback(
    async (period: NetWorthPeriod): Promise<void> => {
      if (!isAuthenticated) return;
      try {
        const data = await reportService.getNetWorthOverTime({ period });
        setNetWorth(data);
      } catch (err) {
        setError(err as ApiError);
      }
    },
    [isAuthenticated],
  );

  const fetchBudgetPerformance = useCallback(
    async (budgetId?: string): Promise<void> => {
      if (!isAuthenticated) return;
      try {
        const data = await reportService.getBudgetPerformance({ budgetId });
        setBudgetPerformance(data);
      } catch {
        // Budget might not exist — treat as non-fatal
        setBudgetPerformance(null);
      }
    },
    [isAuthenticated],
  );

  // Initial parallel fetch
  useEffect(() => {
    if (!isAuthenticated || authLoading || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    setLoading(true);
    setError(null);

    Promise.all([
      reportService.getIncomeExpenseSummary({ period: 'month' }).then(setIncomeExpense),
      reportService.getAccountSummary().then(setAccountSummary),
      reportService.getNetWorthOverTime({ period: 'year' }).then(setNetWorth),
      reportService
        .getBudgetPerformance()
        .then(setBudgetPerformance)
        .catch(() => null),
    ])
      .catch((err) => setError(err as ApiError))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  return {
    incomeExpense,
    accountSummary,
    netWorth,
    budgetPerformance,
    loading,
    error,
    fetchIncomeExpense,
    fetchAccountSummary,
    fetchNetWorth,
    fetchBudgetPerformance,
  };
};
