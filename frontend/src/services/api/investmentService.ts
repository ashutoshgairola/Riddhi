// src/services/api/investmentService.ts
import {
  AssetAllocation,
  CreateInvestmentRequest,
  CreateInvestmentTxRequest,
  GetInvestmentsQuery,
  GetPortfolioPerformanceQuery,
  Investment,
  InvestmentReturns,
  InvestmentTransaction,
  PortfolioPerformancePoint,
  PortfolioSummary,
  UpdateInvestmentRequest,
} from '../../types/investment.types';
import apiClient from './apiClient';

// ── Response shapes that mirror the backend sendResponse envelope ─────────────

interface InvestmentsListResponse {
  data: {
    items: Investment[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface InvestmentResponse {
  data: Investment;
}

interface PortfolioSummaryResponse {
  data: PortfolioSummary;
}

interface PortfolioAllocationResponse {
  data: { allocations: AssetAllocation[] };
}

interface PortfolioPerformanceResponse {
  data: { performance: PortfolioPerformancePoint[] };
}

interface InvestmentTransactionsResponse {
  data: { items: InvestmentTransaction[]; total: number };
}

interface InvestmentTransactionResponse {
  data: InvestmentTransaction;
}

interface InvestmentReturnsResponse {
  data: InvestmentReturns;
}

// ── Service class ─────────────────────────────────────────────────────────────

class InvestmentService {
  private baseUrl = '/api/investments';

  // ── Core CRUD ───────────────────────────────────────────────────────────────

  public async getAll(query?: GetInvestmentsQuery): Promise<InvestmentsListResponse> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
    return apiClient.get<InvestmentsListResponse>(url);
  }

  public async getById(id: string): Promise<InvestmentResponse> {
    return apiClient.get<InvestmentResponse>(`${this.baseUrl}/${id}`);
  }

  public async create(data: CreateInvestmentRequest): Promise<InvestmentResponse> {
    return apiClient.post<InvestmentResponse, CreateInvestmentRequest>(this.baseUrl, data);
  }

  public async update(id: string, data: UpdateInvestmentRequest): Promise<InvestmentResponse> {
    return apiClient.put<InvestmentResponse, UpdateInvestmentRequest>(
      `${this.baseUrl}/${id}`,
      data,
    );
  }

  public async remove(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ── Portfolio analytics ─────────────────────────────────────────────────────

  public async getPortfolioSummary(): Promise<PortfolioSummaryResponse> {
    return apiClient.get<PortfolioSummaryResponse>(`${this.baseUrl}/portfolio/summary`);
  }

  public async getPortfolioAllocation(): Promise<PortfolioAllocationResponse> {
    return apiClient.get<PortfolioAllocationResponse>(`${this.baseUrl}/portfolio/allocation`);
  }

  public async getPortfolioPerformance(
    query?: GetPortfolioPerformanceQuery,
  ): Promise<PortfolioPerformanceResponse> {
    const params = new URLSearchParams();
    if (query?.from) params.append('from', query.from);
    if (query?.to) params.append('to', query.to);
    const url = params.toString()
      ? `${this.baseUrl}/portfolio/performance?${params.toString()}`
      : `${this.baseUrl}/portfolio/performance`;
    return apiClient.get<PortfolioPerformanceResponse>(url);
  }

  // ── Per-holding transactions ────────────────────────────────────────────────

  public async getTransactions(investmentId: string): Promise<InvestmentTransactionsResponse> {
    return apiClient.get<InvestmentTransactionsResponse>(
      `${this.baseUrl}/${investmentId}/transactions`,
    );
  }

  public async createTransaction(
    investmentId: string,
    data: CreateInvestmentTxRequest,
  ): Promise<InvestmentTransactionResponse> {
    return apiClient.post<InvestmentTransactionResponse, CreateInvestmentTxRequest>(
      `${this.baseUrl}/${investmentId}/transactions`,
      data,
    );
  }

  public async deleteTransaction(investmentId: string, txId: string): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${investmentId}/transactions/${txId}`);
  }

  // ── Returns ─────────────────────────────────────────────────────────────────

  public async getReturns(investmentId: string): Promise<InvestmentReturnsResponse> {
    return apiClient.get<InvestmentReturnsResponse>(`${this.baseUrl}/${investmentId}/returns`);
  }
}

const investmentService = new InvestmentService();
export default investmentService;
