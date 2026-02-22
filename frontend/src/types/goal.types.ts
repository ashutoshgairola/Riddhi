// src/types/goal.types.ts
export type GoalType = 'savings' | 'debt' | 'retirement' | 'major_purchase' | 'other';
export type GoalStatus = 'active' | 'completed' | 'paused';
export type ContributionFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  accountId?: string;
  notes?: string;
  color?: string;
  priority: number;
  status: GoalStatus;
  contributionFrequency?: ContributionFrequency;
  contributionAmount?: number;
}

export interface GoalProgress {
  percentage: number;
  remaining: number;
  projectedCompletion?: string;
}

export interface GoalDetail extends Goal {
  progress: GoalProgress;
}

export interface CreateGoalRequest {
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  accountId?: string;
  notes?: string;
  color?: string;
  priority: number;
  contributionFrequency?: ContributionFrequency;
  contributionAmount?: number;
}

export interface UpdateGoalRequest {
  name?: string;
  type?: GoalType;
  targetAmount?: number;
  currentAmount?: number;
  startDate?: string;
  targetDate?: string;
  accountId?: string;
  notes?: string;
  color?: string;
  priority?: number;
  contributionFrequency?: ContributionFrequency;
  contributionAmount?: number;
}

export interface GetGoalsQuery {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}
