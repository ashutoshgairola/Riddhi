import dayjs from 'dayjs';
import { Db } from 'mongodb';

import { getErrorMessage } from '../../common/utils';
import { createChildLogger } from '../../config/logger';
import { GoalModel } from '../../goals/db';
import { Goal } from '../../goals/types/interface';
import { NotificationService } from '../../notifications/service';
import { JobResult } from '../types/interface';

const logger = createChildLogger({ job: 'GoalContributions' });

/**
 * Processes scheduled goal contributions.
 *
 * Logic:
 * 1. Find all active goals with a contributionFrequency and contributionAmount > 0
 * 2. Check if a contribution is due today based on frequency + last contribution date
 * 3. Increment currentAmount (capped at targetAmount)
 * 4. Auto-complete if target is reached
 * 5. Fire goal_progress notification on milestones (25%, 50%, 75%, 100%)
 *
 * Runs daily at 2:00 AM — frequency check handles weekly/biweekly/monthly.
 *
 * The `lastContributionDate` field on the Goal document tracks when the scheduler
 * last processed a contribution. If this field doesn't exist yet, it falls back
 * to using the goal's `createdAt` date.
 */
export function createGoalContributionsJob(db: Db, notificationService?: NotificationService) {
  const goalModel = new GoalModel(db);

  return async (): Promise<JobResult> => {
    const errors: string[] = [];
    let processedCount = 0;
    const milestoneThresholds = [25, 50, 75, 100];

    try {
      const today = dayjs().startOf('day');

      // Find all active goals with recurring contributions configured
      const goals = await goalModel.collection
        .find({
          status: 'active',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contributionFrequency: { $exists: true, $ne: null } as any,
          contributionAmount: { $gt: 0 },
        })
        .toArray();

      logger.info({ count: goals.length }, 'Found goals with recurring contributions');

      for (const goal of goals) {
        try {
          const frequency = goal.contributionFrequency ?? 'monthly';
          const amount = goal.contributionAmount ?? 0;

          // Determine last contribution date
          const goalWithExtra = goal as Goal & { lastContributionDate?: Date };
          const lastContribution = goalWithExtra.lastContributionDate
            ? dayjs(goalWithExtra.lastContributionDate)
            : dayjs(goal.createdAt);

          const nextDueDate = calculateNextContributionDate(lastContribution, frequency);

          if (nextDueDate.isAfter(today)) {
            continue; // not due yet
          }

          // Calculate new amount, capped at target
          const previousAmount = goal.currentAmount;
          const newAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
          const isNowComplete = newAmount >= goal.targetAmount;

          // Build update
          const updates: Partial<Goal> & { lastContributionDate?: Date } = {
            currentAmount: Math.round(newAmount * 100) / 100,
            lastContributionDate: today.toDate(),
          };

          if (isNowComplete) {
            updates.status = 'completed';
          }

          const goalId = goal._id?.toString() ?? '';
          await goalModel.update(goalId, goal.userId, updates);

          processedCount++;

          logger.info(
            {
              goalId,
              userId: goal.userId,
              amount,
              newTotal: newAmount,
              completed: isNowComplete,
            },
            'Processed goal contribution',
          );

          // Fire milestone notifications
          if (notificationService) {
            const prevPercent =
              goal.targetAmount > 0 ? (previousAmount / goal.targetAmount) * 100 : 0;
            const newPercent = goal.targetAmount > 0 ? (newAmount / goal.targetAmount) * 100 : 0;

            for (const threshold of milestoneThresholds) {
              if (prevPercent < threshold && newPercent >= threshold) {
                try {
                  await notificationService.send({
                    userId: goal.userId,
                    payload: {
                      type: 'goal_progress',
                      userName: '',
                      goalName: goal.name,
                      currentAmount: newAmount,
                      targetAmount: goal.targetAmount,
                      percentComplete: Math.min(100, Math.round(newPercent)),
                      currency: '₹',
                    },
                  });
                } catch (notifError: unknown) {
                  logger.warn(
                    { error: notifError, goalId, threshold },
                    'Failed to send goal milestone notification',
                  );
                }
                break;
              }
            }
          }
        } catch (error: unknown) {
          const msg = `Failed to process goal ${goal._id}: ${getErrorMessage(error)}`;
          logger.error({ error, goalId: goal._id }, msg);
          errors.push(msg);
        }
      }
    } catch (error: unknown) {
      logger.error({ error }, 'Goal contributions job failed');
      errors.push(`Job-level error: ${getErrorMessage(error)}`);
    }

    return {
      processedCount,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  };
}

function calculateNextContributionDate(lastDate: dayjs.Dayjs, frequency: string): dayjs.Dayjs {
  switch (frequency) {
    case 'daily':
      return lastDate.add(1, 'day');
    case 'weekly':
      return lastDate.add(1, 'week');
    case 'biweekly':
      return lastDate.add(2, 'week');
    case 'monthly':
      return lastDate.add(1, 'month');
    default:
      return lastDate.add(1, 'month');
  }
}
