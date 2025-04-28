// src/types/account.types.ts
export type AccountType =
  | 'checking'
  | 'savings'
  | 'credit'
  | 'investment'
  | 'cash'
  | 'loan'
  | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  institutionName?: string;
  institutionLogo?: string;
  lastUpdated: string;
  isConnected: boolean;
  connectionId?: string;
  includeInNetWorth: boolean;
  color?: string;
}
