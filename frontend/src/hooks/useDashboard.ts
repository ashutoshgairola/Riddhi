// src/hooks/useDashboard.ts
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api/apiClient';
import dashboardService from '../services/api/dashboardService';
import { DashboardData } from '../types/dashboard.types';

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export const useDashboard = (): UseDashboardReturn => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const hasFetched = useRef(false);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getDashboardData();
      setData(result);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  return { data, loading, error, refetch: fetchData };
};
