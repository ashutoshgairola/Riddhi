// src/services/api/reportService.ts
import {
  AccountSummaryQuery,
  AccountSummaryResponse,
  BudgetPerformanceQuery,
  BudgetPerformanceResponse,
  CategoryReportQuery,
  CategoryReportResponse,
  CustomReportRequest,
  CustomReportResponse,
  IncomeExpenseQuery,
  IncomeExpenseResponse,
  NetWorthQuery,
  NetWorthResponse,
} from '../../types/report.types';
import apiClient from './apiClient';

// Backend wraps every response in { status, data, message }
interface Envelope<T> {
  status: number;
  data: T;
  message: string;
}

class ReportService {
  private baseUrl = '/api/reports';

  public async getAccountSummary(query?: AccountSummaryQuery): Promise<AccountSummaryResponse> {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    const qs = params.toString();
    const res = await apiClient.get<Envelope<AccountSummaryResponse>>(
      `${this.baseUrl}/accounts/summary${qs ? `?${qs}` : ''}`,
    );
    return res.data;
  }

  public async getIncomeExpenseSummary(query: IncomeExpenseQuery): Promise<IncomeExpenseResponse> {
    const params = new URLSearchParams({ period: query.period });
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    const res = await apiClient.get<Envelope<IncomeExpenseResponse>>(
      `${this.baseUrl}/income-expense?${params.toString()}`,
    );
    return res.data;
  }

  public async getCategoryReport(query: CategoryReportQuery): Promise<CategoryReportResponse> {
    const params = new URLSearchParams({
      categoryId: query.categoryId,
      period: query.period,
    });
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    const res = await apiClient.get<Envelope<CategoryReportResponse>>(
      `${this.baseUrl}/categories?${params.toString()}`,
    );
    return res.data;
  }

  public async getBudgetPerformance(
    query?: BudgetPerformanceQuery,
  ): Promise<BudgetPerformanceResponse> {
    const params = new URLSearchParams();
    if (query?.budgetId) params.append('budgetId', query.budgetId);
    const qs = params.toString();
    const res = await apiClient.get<Envelope<BudgetPerformanceResponse>>(
      `${this.baseUrl}/budget-performance${qs ? `?${qs}` : ''}`,
    );
    return res.data;
  }

  public async getNetWorthOverTime(query?: NetWorthQuery): Promise<NetWorthResponse> {
    const params = new URLSearchParams();
    if (query?.period) params.append('period', query.period);
    const qs = params.toString();
    const res = await apiClient.get<Envelope<NetWorthResponse>>(
      `${this.baseUrl}/net-worth${qs ? `?${qs}` : ''}`,
    );
    return res.data;
  }

  public async getCustomReport(request: CustomReportRequest): Promise<CustomReportResponse> {
    const res = await apiClient.post<Envelope<CustomReportResponse>, CustomReportRequest>(
      `${this.baseUrl}/custom`,
      request,
    );
    return res.data;
  }
}

const reportService = new ReportService();
export default reportService;
