import { Db } from 'mongodb';

import { GoalModel } from './db';
import {
  ContributionFrequency,
  CreateGoalRequest,
  GetGoalsQuery,
  Goal,
  GoalDTO,
  GoalDetailDTO,
  GoalsResponse,
  UpdateGoalRequest,
} from './types/interface';

export class GoalService {
  private goalModel: GoalModel;

  constructor(db: Db) {
    this.goalModel = new GoalModel(db);
  }

  async initialize(): Promise<void> {
    await this.goalModel.initialize();
  }

  async getGoals(userId: string, query: GetGoalsQuery): Promise<GoalsResponse> {
    const { goals, pagination } = await this.goalModel.findAll(userId, query);
    const goalDTOs = goals.map((goal) => this.mapGoalToDTO(goal));

    return {
      data: goalDTOs,
      pagination,
    };
  }

  async getGoalById(id: string, userId: string): Promise<GoalDetailDTO> {
    const goal = await this.goalModel.findById(id, userId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    return this.mapGoalToDetailDTO(goal);
  }

  async createGoal(userId: string, goalData: CreateGoalRequest): Promise<GoalDTO> {
    // Validate dates
    const startDate = new Date(goalData.startDate);
    const targetDate = new Date(goalData.targetDate);

    if (isNaN(startDate.getTime()) || isNaN(targetDate.getTime())) {
      throw new Error('Invalid date format');
    }

    if (startDate >= targetDate) {
      throw new Error('Start date must be before target date');
    }

    // Validate amounts
    if (goalData.targetAmount <= 0) {
      throw new Error('Target amount must be greater than zero');
    }

    if (goalData.currentAmount < 0) {
      throw new Error('Current amount cannot be negative');
    }

    if (goalData.currentAmount > goalData.targetAmount) {
      throw new Error('Current amount cannot exceed target amount');
    }

    // Validate priority
    if (goalData.priority < 1 || goalData.priority > 3) {
      throw new Error('Priority must be between 1 and 3');
    }

    // Create the goal
    const goalToCreate: Omit<Goal, '_id' | 'createdAt' | 'updatedAt'> = {
      userId,
      name: goalData.name,
      type: goalData.type,
      targetAmount: goalData.targetAmount,
      currentAmount: goalData.currentAmount,
      startDate,
      targetDate,
      accountId: goalData.accountId,
      notes: goalData.notes,
      color: goalData.color,
      priority: goalData.priority,
      status: 'active', // New goals always start as active
      contributionFrequency: goalData.contributionFrequency,
      contributionAmount: goalData.contributionAmount,
    };

    const createdGoal = await this.goalModel.create(goalToCreate);
    return this.mapGoalToDTO(createdGoal);
  }

  async updateGoal(id: string, userId: string, updates: UpdateGoalRequest): Promise<GoalDTO> {
    const goal = await this.goalModel.findById(id, userId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    // Prepare updates
    const goalUpdates: Partial<Goal> = {};

    // Handle name update
    if (updates.name !== undefined) {
      goalUpdates.name = updates.name;
    }

    // Handle type update
    if (updates.type !== undefined) {
      goalUpdates.type = updates.type;
    }

    // Handle amount updates
    if (updates.targetAmount !== undefined) {
      if (updates.targetAmount <= 0) {
        throw new Error('Target amount must be greater than zero');
      }

      // If we're lowering the target amount and it's now less than the current amount,
      // cap the current amount at the target amount
      if (updates.targetAmount < goal.currentAmount) {
        goalUpdates.currentAmount = updates.targetAmount;
      }

      goalUpdates.targetAmount = updates.targetAmount;
    }

    if (updates.currentAmount !== undefined) {
      if (updates.currentAmount < 0) {
        throw new Error('Current amount cannot be negative');
      }

      const targetAmount =
        updates.targetAmount !== undefined ? updates.targetAmount : goal.targetAmount;
      if (updates.currentAmount > targetAmount) {
        throw new Error('Current amount cannot exceed target amount');
      }

      goalUpdates.currentAmount = updates.currentAmount;
    }

    // FIX: Auto-complete when currentAmount meets targetAmount,
    // regardless of which field triggered it (target reduction OR current increase).
    // Previously this only fired inside the `updates.currentAmount !== undefined` block,
    // so reducing targetAmount to match currentAmount left the goal stuck as active.
    const effectiveTarget = goalUpdates.targetAmount ?? goal.targetAmount;
    const effectiveCurrent = goalUpdates.currentAmount ?? goal.currentAmount;

    if (effectiveCurrent >= effectiveTarget && goal.status === 'active') {
      goalUpdates.status = 'completed';
    }

    // Handle date updates
    let startDate = goal.startDate;
    let targetDate = goal.targetDate;

    if (updates.startDate) {
      startDate = new Date(updates.startDate);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start date format');
      }
      goalUpdates.startDate = startDate;
    }

    if (updates.targetDate) {
      targetDate = new Date(updates.targetDate);
      if (isNaN(targetDate.getTime())) {
        throw new Error('Invalid target date format');
      }
      goalUpdates.targetDate = targetDate;
    }

    // Validate date order
    if (startDate >= targetDate) {
      throw new Error('Start date must be before target date');
    }

    // Handle other updates
    if (updates.accountId !== undefined) {
      goalUpdates.accountId = updates.accountId;
    }

    if (updates.notes !== undefined) {
      goalUpdates.notes = updates.notes;
    }

    if (updates.color !== undefined) {
      goalUpdates.color = updates.color;
    }

    if (updates.priority !== undefined) {
      if (updates.priority < 1 || updates.priority > 3) {
        throw new Error('Priority must be between 1 and 3');
      }
      goalUpdates.priority = updates.priority;
    }

    if (updates.contributionFrequency !== undefined) {
      goalUpdates.contributionFrequency = updates.contributionFrequency;
    }

    if (updates.contributionAmount !== undefined) {
      goalUpdates.contributionAmount = updates.contributionAmount;
    }

    // Apply updates
    const updatedGoal = await this.goalModel.update(id, userId, goalUpdates);

    if (!updatedGoal) {
      throw new Error('Failed to update goal');
    }

    return this.mapGoalToDTO(updatedGoal);
  }

  async deleteGoal(id: string, userId: string): Promise<void> {
    const goal = await this.goalModel.findById(id, userId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const deleted = await this.goalModel.delete(id, userId);

    if (!deleted) {
      throw new Error('Failed to delete goal');
    }
  }

  async completeGoal(id: string, userId: string): Promise<GoalDTO> {
    const goal = await this.goalModel.findById(id, userId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    if (goal.status === 'completed') {
      throw new Error('Goal is already completed');
    }

    const updatedGoal = await this.goalModel.updateStatus(id, userId, 'completed');

    if (!updatedGoal) {
      throw new Error('Failed to complete goal');
    }

    return this.mapGoalToDTO(updatedGoal);
  }

  async pauseGoal(id: string, userId: string): Promise<GoalDTO> {
    const goal = await this.goalModel.findById(id, userId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    if (goal.status === 'completed') {
      throw new Error('Completed goals cannot be paused');
    }

    if (goal.status === 'paused') {
      throw new Error('Goal is already paused');
    }

    const updatedGoal = await this.goalModel.updateStatus(id, userId, 'paused');

    if (!updatedGoal) {
      throw new Error('Failed to pause goal');
    }

    return this.mapGoalToDTO(updatedGoal);
  }

  async resumeGoal(id: string, userId: string): Promise<GoalDTO> {
    const goal = await this.goalModel.findById(id, userId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    if (goal.status !== 'paused') {
      throw new Error('Only paused goals can be resumed');
    }

    const updatedGoal = await this.goalModel.updateStatus(id, userId, 'active');

    if (!updatedGoal) {
      throw new Error('Failed to resume goal');
    }

    return this.mapGoalToDTO(updatedGoal);
  }

  private mapGoalToDTO(goal: Goal): GoalDTO {
    return {
      id: goal._id?.toString() ?? '',
      name: goal.name,
      type: goal.type,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      startDate: goal.startDate.toISOString(),
      targetDate: goal.targetDate.toISOString(),
      accountId: goal.accountId,
      notes: goal.notes,
      color: goal.color,
      priority: goal.priority,
      status: goal.status,
      contributionFrequency: goal.contributionFrequency,
      contributionAmount: goal.contributionAmount,
    };
  }

  private mapGoalToDetailDTO(goal: Goal): GoalDetailDTO {
    const dto = this.mapGoalToDTO(goal);

    // FIX: Guard zero targetAmount AND clamp percentage to 100
    const percentage =
      goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
    // FIX: Floor remaining at 0 to handle any overshoot edge case
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

    let projectedCompletion: string | undefined = undefined;

    // FIX: Only calculate projected completion for active goals with remaining amount.
    // Previously this ran for completed/paused goals, returning misleading dates.
    if (
      goal.status === 'active' &&
      remaining > 0 &&
      goal.contributionFrequency &&
      goal.contributionAmount &&
      goal.contributionAmount > 0
    ) {
      const daysLeft = this.calculateDaysToCompletion(
        remaining,
        goal.contributionAmount,
        goal.contributionFrequency,
      );

      if (daysLeft > 0) {
        const projectedDate = new Date();
        projectedDate.setDate(projectedDate.getDate() + daysLeft);
        projectedCompletion = projectedDate.toISOString();
      }
    }

    return {
      ...dto,
      progress: {
        percentage,
        remaining,
        projectedCompletion,
      },
    };
  }

  private calculateDaysToCompletion(
    remainingAmount: number,
    contributionAmount: number,
    frequency: ContributionFrequency,
  ): number {
    const contributions = Math.ceil(remainingAmount / contributionAmount);

    // FIX: Added daily frequency so it doesn't silently fall through to 30 days
    let daysPerContribution: number;
    switch (frequency) {
      case 'daily':
        daysPerContribution = 1;
        break;
      case 'weekly':
        daysPerContribution = 7;
        break;
      case 'biweekly':
        daysPerContribution = 14;
        break;
      case 'monthly':
        daysPerContribution = 30;
        break;
      default:
        daysPerContribution = 30;
    }

    return contributions * daysPerContribution;
  }
}
