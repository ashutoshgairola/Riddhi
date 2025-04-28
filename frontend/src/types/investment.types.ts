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
}

export interface AssetAllocation {
  assetClass: AssetClass;
  percentage: number;
  amount: number;
  color: string;
}
