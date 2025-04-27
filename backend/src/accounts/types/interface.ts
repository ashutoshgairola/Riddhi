// Account domain types
import { ObjectId } from "mongodb";

export type AccountType =
  | "checking"
  | "savings"
  | "credit"
  | "investment"
  | "cash"
  | "loan"
  | "other";

export interface Account {
  _id?: string | ObjectId;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  institutionName?: string;
  institutionLogo?: string;
  lastUpdated: Date;
  isConnected: boolean;
  connectionId?: string;
  includeInNetWorth: boolean;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountDTO {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  institutionName?: string;
  institutionLogo?: string;
  lastUpdated: string; // ISO date
  isConnected: boolean;
  connectionId?: string;
  includeInNetWorth: boolean;
  color?: string;
}

export interface AccountDetailDTO extends AccountDTO {
  transactions: {
    id: string;
    date: string; // ISO date
    description: string;
    amount: number;
    type: string; // 'income', 'expense', or 'transfer'
    status: string; // 'cleared', 'pending', or 'reconciled'
  }[];
}

// Request types
export interface GetAccountsQuery {
  type?: string; // comma-separated list of AccountType
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  institutionName?: string;
  institutionLogo?: string;
  includeInNetWorth: boolean;
  color?: string;
}

export interface UpdateAccountRequest {
  name?: string;
  type?: AccountType;
  balance?: number;
  currency?: string;
  institutionName?: string;
  institutionLogo?: string;
  includeInNetWorth?: boolean;
  color?: string;
}

export interface AccountsResponse {
  data: AccountDTO[];
}
