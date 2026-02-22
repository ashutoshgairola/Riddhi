// src/types/investment.types.ts
export type AssetClass = 'stocks' | 'bonds' | 'cash' | 'alternatives' | 'real_estate' | 'other';
export type InvestmentType =
  | 'individual_stock'
  | 'etf'
  | 'mutual_fund'
  | 'bond'
  | 'crypto'
  | 'options'
  | 'reit'
  | 'other';
export type InvestmentTxType = 'buy' | 'sell' | 'dividend';

// ── Core domain ───────────────────────────────────────────────────────────────

export interface Investment {
  id: string;
  name: string;
  ticker?: string;
  assetClass: AssetClass;
  type: InvestmentType;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  accountId: string;
  notes?: string;
  dividendYield?: number;
  sector?: string;
  region?: string;
  currency: string;
  // computed fields returned by the API
  currentValue: number;
  totalInvested: number;
  gainLoss: number;
  returnPercent: number;
}

export interface AssetAllocation {
  assetClass: AssetClass;
  percentage: number;
  amount: number;
  color: string;
}

export interface PortfolioPerformancePoint {
  date: string; // YYYY-MM
  value: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  thirtyDayReturnPercent: number;
  ytdReturnPercent: number;
  numberOfHoldings: number;
}

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  type: InvestmentTxType;
  shares: number | null;
  price: number | null;
  amount: number;
  date: string;
  notes: string | null;
}

export interface InvestmentReturns {
  investmentId: string;
  totalInvested: number;
  currentValue: number;
  unrealisedGainLoss: number;
  unrealisedReturnPercent: number;
  realisedGainLoss: number;
  dividendIncome: number;
  totalReturn: number;
  totalReturnPercent: number;
}

// ── Request / query types ─────────────────────────────────────────────────────

export interface GetInvestmentsQuery {
  assetClass?: string;
  type?: string;
  accountId?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateInvestmentRequest {
  name: string;
  ticker?: string;
  assetClass: AssetClass;
  type: InvestmentType;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  accountId: string;
  notes?: string;
  dividendYield?: number;
  sector?: string;
  region?: string;
  currency: string;
}

export interface UpdateInvestmentRequest {
  name?: string;
  ticker?: string;
  assetClass?: AssetClass;
  type?: InvestmentType;
  shares?: number;
  purchasePrice?: number;
  currentPrice?: number;
  purchaseDate?: string;
  accountId?: string;
  notes?: string;
  dividendYield?: number;
  sector?: string;
  region?: string;
  currency?: string;
}

export interface CreateInvestmentTxRequest {
  type: InvestmentTxType;
  shares?: number;
  price?: number;
  amount?: number;
  date: string;
  notes?: string;
}

export interface GetPortfolioPerformanceQuery {
  from?: string; // YYYY-MM
  to?: string; // YYYY-MM
}
