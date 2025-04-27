// src/types/goal.types.ts
export type GoalType =
  | "savings"
  | "debt"
  | "retirement"
  | "major_purchase"
  | "other";
export type GoalStatus = "active" | "completed" | "paused";

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
  contributionFrequency?: "weekly" | "biweekly" | "monthly";
  contributionAmount?: number;
}
