// Goals domain types
import { ObjectId } from 'mongodb';

export type GoalType = 'savings' | 'debt' | 'retirement' | 'major_purchase' | 'other';
export type GoalStatus = 'active' | 'completed' | 'paused';
export type ContributionFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface Goal {
  _id?: string | ObjectId;
  userId: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate: Date;
  accountId?: string;
  notes?: string;
  color?: string;
  priority: number; // 1-3, 1 being highest
  status: GoalStatus;
  contributionFrequency?: ContributionFrequency;
  contributionAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalDTO {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  startDate: string; // ISO date
  targetDate: string; // ISO date
  accountId?: string;
  notes?: string;
  color?: string;
  priority: number;
  status: GoalStatus;
  contributionFrequency?: ContributionFrequency;
  contributionAmount?: number;
}

export interface GoalDetailDTO extends GoalDTO {
  progress: {
    percentage: number;
    remaining: number;
    projectedCompletion?: string; // ISO date
  };
}

// Request types
export interface GetGoalsQuery {
  type?: string; // comma-separated list of GoalType
  status?: string; // comma-separated list of GoalStatus
  page?: number;
  limit?: number;
}

export interface CreateGoalRequest {
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  startDate: string; // ISO date
  targetDate: string; // ISO date
  accountId?: string;
  notes?: string;
  color?: string;
  priority: number; // 1-3, 1 being highest
  contributionFrequency?: ContributionFrequency;
  contributionAmount?: number;
}

export interface UpdateGoalRequest {
  name?: string;
  type?: GoalType;
  targetAmount?: number;
  currentAmount?: number;
  startDate?: string; // ISO date
  targetDate?: string; // ISO date
  accountId?: string;
  notes?: string;
  color?: string;
  priority?: number; // 1-3, 1 being highest
  contributionFrequency?: ContributionFrequency;
  contributionAmount?: number;
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface GoalsResponse {
  data: GoalDTO[];
  pagination: PaginationResponse;
}
