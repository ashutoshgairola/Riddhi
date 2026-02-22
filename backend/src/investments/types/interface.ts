import { ObjectId } from 'mongodb';

export type AssetClass = 'stocks' | 'bonds' | 'cash' | 'alternatives' | 'real_estate' | 'other';
export type InvestmentType =
  | 'individual_stock' | 'etf' | 'mutual_fund' | 'bond'
  | 'crypto' | 'options' | 'reit' | 'other';
export type InvestmentTxType = 'buy' | 'sell' | 'dividend';

// ── MongoDB documents ─────────────────────────────────────────────────────────

export interface Investment {
  _id?: string | ObjectId;
  userId: string;
  name: string;
  ticker?: string;
  assetClass: AssetClass;
  type: InvestmentType;
  shares: number;
  purchasePrice: number;     // weighted average cost basis
  currentPrice: number;
  purchaseDate: string;      // ISO date (date of first buy)
  accountId: string;
  notes?: string;
  dividendYield?: number;
  sector?: string;
  region?: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentTransaction {
  _id?: string | ObjectId;
  investmentId: string | ObjectId;
  userId: string;
  type: InvestmentTxType;
  shares?: number;
  price?: number;
  amount: number;            // shares × price for buy/sell; raw amount for dividend
  date: string;              // ISO date
  notes?: string;
  createdAt: Date;
}

// ── DTOs (sent to client) ─────────────────────────────────────────────────────

export interface InvestmentDTO {
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
  // computed fields
  currentValue: number;
  totalInvested: number;
  gainLoss: number;
  returnPercent: number;
}

export interface InvestmentTransactionDTO {
  id: string;
  investmentId: string;
  type: InvestmentTxType;
  shares: number | null;
  price: number | null;
  amount: number;
  date: string;
  notes: string | null;
}

export interface PortfolioSummaryDTO {
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

export interface AssetAllocationDTO {
  assetClass: AssetClass;
  percentage: number;
  amount: number;
  color: string;
}

export interface PortfolioPerformancePointDTO {
  date: string;   // YYYY-MM
  value: number;
}

export interface InvestmentReturnsDTO {
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

// ── Request types ─────────────────────────────────────────────────────────────

export interface GetInvestmentsQuery {
  assetClass?: string;       // comma-separated AssetClass values
  type?: string;             // comma-separated InvestmentType values
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
  from?: string;   // YYYY-MM
  to?: string;     // YYYY-MM
}

// ── Paginated response wrapper ────────────────────────────────────────────────

export interface InvestmentsResponse {
  items: InvestmentDTO[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface InvestmentTransactionsResponse {
  items: InvestmentTransactionDTO[];
  total: number;
}
