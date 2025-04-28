// Settings domain types
import { ObjectId } from 'mongodb';

export interface UserPreferences {
  _id?: string | ObjectId;
  userId: string;
  currency: string; // 'USD', 'EUR', etc.
  dateFormat: string; // 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'
  theme: string; // 'light', 'dark', 'system'
  startOfWeek: string; // 'sunday', 'monday'
  language: string; // 'en', 'es', 'fr', etc.
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferencesDTO {
  currency: string;
  dateFormat: string;
  theme: string;
  startOfWeek: string;
  language: string;
}

export interface NotificationSetting {
  _id?: string | ObjectId;
  userId: string;
  name: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettingDTO {
  id: string;
  name: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface AccountConnection {
  _id?: string | ObjectId;
  userId: string;
  name: string;
  type: string; // 'bank', 'credit_card', 'investment'
  institutionId: string;
  institutionName: string;
  institutionLogo?: string;
  isConnected: boolean;
  lastUpdated: Date;
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
  }[];
  credentials?: {
    encrypted: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountConnectionDTO {
  id: string;
  name: string;
  type: string;
  institutionName: string;
  institutionLogo?: string;
  isConnected: boolean;
  lastUpdated: string; // ISO date
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
  }[];
}

// Request types
export interface UpdateUserPreferencesRequest {
  currency?: string;
  dateFormat?: string;
  theme?: string;
  startOfWeek?: string;
  language?: string;
}

export interface UpdateNotificationSettingRequest {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
}

export interface ConnectAccountRequest {
  institutionId: string;
  credentials: {
    username: string;
    password: string;
    [key: string]: string; // Other institution-specific fields
  };
}

export interface ExportDataQuery {
  format: 'csv' | 'json';
  type?: string; // 'transactions', 'budgets', 'goals', 'all'
}

export interface ImportDataRequest {
  file: Express.Multer.File;
  type: string; // 'transactions', 'budgets', 'goals'
}

export interface ClearDataRequest {
  types: string[]; // Array of data types to clear: 'transactions', 'budgets', 'goals', etc.
  confirmation: string; // Text confirmation, e.g., "DELETE MY DATA"
}

export interface ImportStats {
  imported: number;
  skipped: number;
  errors: number;
}

export interface NotificationSettingsResponse {
  data: NotificationSettingDTO[];
}

export interface AccountConnectionsResponse {
  data: AccountConnectionDTO[];
}
