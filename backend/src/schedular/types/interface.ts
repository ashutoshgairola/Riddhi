import { ObjectId } from 'mongodb';

// ── Job identifiers ─────────────────────────────────────────────────────────

export type JobName =
  | 'recurring_transactions'
  | 'goal_contributions'
  | 'monthly_reports'
  | 'budget_alerts'
  | 'overdue_goals_check';

// ── Execution log (persisted to MongoDB) ────────────────────────────────────

export interface JobExecution {
  _id?: ObjectId;
  jobName: JobName;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed';
  processedCount: number;
  errorCount: number;
  errors?: string[];
  metadata?: Record<string, unknown>;
}

// ── Job registration ────────────────────────────────────────────────────────

export interface JobDefinition {
  name: JobName;
  schedule: string;          // cron expression
  handler: () => Promise<JobResult>;
  enabled: boolean;
  description: string;
}

export interface JobResult {
  processedCount: number;
  errorCount: number;
  errors?: string[];
  metadata?: Record<string, unknown>;
}

// ── Recurring transaction config ────────────────────────────────────────────

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface RecurringTransactionConfig {
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  recurringId?: string;
  lastProcessedDate?: Date;
  nextDueDate?: Date;
}
