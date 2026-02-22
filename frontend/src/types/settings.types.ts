// src/types/settings.types.ts

export interface UserPreferencesDTO {
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  startOfWeek: 'sunday' | 'monday';
  language: string;
}

export interface UpdateUserPreferencesRequest {
  currency?: string;
  dateFormat?: string;
  theme?: string;
  startOfWeek?: string;
  language?: string;
}

export interface NotificationSettingDTO {
  id: string;
  name: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface UpdateNotificationSettingRequest {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
}

export interface ExportDataQuery {
  format: 'csv' | 'json';
  type?: string;
}

export interface ClearDataRequest {
  types: string[];
  confirmation: string;
}

export interface ImportStats {
  imported: number;
  skipped: number;
  errors: number;
}
