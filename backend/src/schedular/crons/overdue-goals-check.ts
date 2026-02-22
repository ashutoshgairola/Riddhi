import { Db } from 'mongodb';

import { getErrorMessage } from '../../common/utils';
import { createChildLogger } from '../../config/logger';
import { GoalModel } from '../../goals/db';
import { NotificationService } from '../../notifications/service';
import { JobResult } from '../types/interface';

const logger = createChildLogger({ job: 'OverdueGoalsCheck' });

/**
 * Finds active goals whose targetDate has passed without reaching the target amount.
 * Sends a goal_progress notification to nudge the user.
 *
 * Runs daily at 9:00 AM.
 */
export function createOverdueGoalsCheckJob(db: Db, notificationService: NotificationService) {
  const goalModel = new GoalModel(db);

  return async (): Promise<JobResult> => {
    const errors: string[] = [];
    let processedCount = 0;

    try {
      const now = new Date();

      // Find active goals that are past their target date
      const overdueGoals = await goalModel.collection
        .find({
          status: 'active',
          targetDate: { $lt: now },
        })
        .toArray();

      logger.info({ count: overdueGoals.length }, 'Found overdue goals');

      for (const goal of overdueGoals) {
        try {
          const percentComplete =
            goal.targetAmount > 0
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
              : 0;

          await notificationService.send({
            userId: goal.userId,
            payload: {
              type: 'goal_progress',
              userName: '',
              goalName: goal.name,
              currentAmount: goal.currentAmount,
              targetAmount: goal.targetAmount,
              percentComplete,
              currency: '₹', // TODO: pull from user preferences
            },
          });

          processedCount++;

          logger.info(
            {
              goalId: goal._id?.toString() ?? '',
              userId: goal.userId,
              percentComplete,
              targetDate: goal.targetDate,
            },
            'Overdue goal notification sent',
          );
        } catch (error: unknown) {
          const msg = `Failed overdue notification for goal ${goal._id}: ${getErrorMessage(error)}`;
          logger.error({ error, goalId: goal._id }, msg);
          errors.push(msg);
        }
      }
    } catch (error: unknown) {
      logger.error({ error }, 'Overdue goals check job failed');
      errors.push(`Job-level error: ${getErrorMessage(error)}`);
    }

    return {
      processedCount,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  };
}
