// src/services/api/dashboardService.ts
import { DashboardData } from '../../types/dashboard.types';
import apiClient from './apiClient';

interface Envelope<T> {
  status: number;
  data: T;
  message: string;
}

class DashboardService {
  private baseUrl = '/api/dashboard';

  public async getDashboardData(): Promise<DashboardData> {
    const res = await apiClient.get<Envelope<DashboardData>>(this.baseUrl);
    return res.data;
  }
}

export default new DashboardService();
