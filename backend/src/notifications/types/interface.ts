import { ObjectId } from 'mongodb';

export type NotificationChannel = 'email' | 'push' | 'sms';

export type NotificationType =
  | 'budget_alert'
  | 'goal_progress'
  | 'large_transaction'
  | 'monthly_report'
  | 'security_alert';

export type NotificationStatus = 'pending' | 'sent' | 'failed';

// ── MongoDB document ────────────────────────────────────────────────────────

export interface NotificationLog {
  _id?: ObjectId;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  status: NotificationStatus;
  error?: string;
  isRead?: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface NotificationLogDTO {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  status: NotificationStatus;
  isRead: boolean;
  createdAt: string;
}

// ── Notification payloads (passed by callers) ───────────────────────────────

export interface BudgetAlertPayload {
  type: 'budget_alert';
  userName: string;
  budgetName: string;
  categoryName: string;
  spent: number;
  allocated: number;
  percentUsed: number;
  currency: string;
}

export interface GoalProgressPayload {
  type: 'goal_progress';
  userName: string;
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  percentComplete: number;
  currency: string;
  projectedDate?: string;
}

export interface LargeTransactionPayload {
  type: 'large_transaction';
  userName: string;
  description: string;
  amount: number;
  accountName: string;
  date: string;
  currency: string;
  transactionType: 'income' | 'expense';
}

export interface MonthlyReportPayload {
  type: 'monthly_report';
  userName: string;
  month: string; // e.g. "January 2026"
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  topCategories: { name: string; amount: number }[];
  currency: string;
  budgetUtilization: number; // percentage
}

export interface SecurityAlertPayload {
  type: 'security_alert';
  userName: string;
  event: string; // e.g. "New login from Chrome on macOS"
  ipAddress?: string;
  location?: string;
  timestamp: string;
}

export type NotificationPayload =
  | BudgetAlertPayload
  | GoalProgressPayload
  | LargeTransactionPayload
  | MonthlyReportPayload
  | SecurityAlertPayload;

// ── Send options ────────────────────────────────────────────────────────────

export interface SendNotificationOptions {
  userId: string;
  email?: string;
  phone?: string;
  pushSubscription?: PushSubscriptionData;
  payload: NotificationPayload;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// ── Provider interfaces ─────────────────────────────────────────────────────

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface SmsPayload {
  to: string;
  message: string;
}

export interface PushPayload {
  subscription: PushSubscriptionData;
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

// ── Notification setting (re-exported for convenience) ──────────────────────

export interface NotificationSetting {
  _id?: ObjectId;
  userId: string;
  name: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Map setting names to notification types
export const SETTING_NAME_TO_TYPE: Record<string, NotificationType> = {
  'Budget Alerts': 'budget_alert',
  'Goal Progress': 'goal_progress',
  'Large Transactions': 'large_transaction',
  'Monthly Reports': 'monthly_report',
  'Security Alerts': 'security_alert',
};

export const TYPE_TO_SETTING_NAME: Record<NotificationType, string> = {
  budget_alert: 'Budget Alerts',
  goal_progress: 'Goal Progress',
  large_transaction: 'Large Transactions',
  monthly_report: 'Monthly Reports',
  security_alert: 'Security Alerts',
};
