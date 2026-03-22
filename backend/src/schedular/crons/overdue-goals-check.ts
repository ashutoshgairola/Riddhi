import { Db } from 'mongodb';

import { getErrorMessage } from '../../common/utils';
import { createChildLogger } from '../../config/logger';
import { GoalModel } from '../../goals/db';
import { NotificationLogModel } from '../../notifications/db';
import { NotificationService } from '../../notifications/service';
import { UserPreferencesModel } from '../../settings/user-preference-db';
import { JobResult } from '../types/interface';

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // one alert per overdue goal per day

const logger = createChildLogger({ job: 'OverdueGoalsCheck' });

/**
 * Finds active goals whose targetDate has passed without reaching the target amount.
 * Sends a goal_progress notification to nudge the user.
 *
 * Runs daily at 9:00 AM.
 */
export function createOverdueGoalsCheckJob(db: Db, notificationService: NotificationService) {
  const goalModel = new GoalModel(db);
  const notificationLogModel = new NotificationLogModel(db);
  const preferencesModel = new UserPreferencesModel(db);

  return async (): Promise<JobResult> => {
    const errors: string[] = [];
    let processedCount = 0;
    const currencyCache = new Map<string, string>();

    const getUserCurrency = async (userId: string): Promise<string> => {
      if (currencyCache.has(userId)) return currencyCache.get(userId) ?? 'INR';
      const userPrefs = await preferencesModel.findByUserId(userId);
      const currency = userPrefs?.currency ?? 'INR';
      currencyCache.set(userId, currency);
      return currency;
    };

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
          const dedupeKey = `overdue_goal:${goal._id?.toString() ?? ''}`;

          const recentAlert = await notificationLogModel.findRecentByDedupeKey(
            goal.userId,
            'goal_progress',
            'sent',
            dedupeKey,
            new Date(Date.now() - COOLDOWN_MS),
          );

          if (recentAlert) continue;

          const percentComplete =
            goal.targetAmount > 0
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
              : 0;

          const currency = await getUserCurrency(goal.userId);

          await notificationService.send({
            userId: goal.userId,
            dedupeKey,
            payload: {
              type: 'goal_progress',
              userName: '',
              goalName: goal.name,
              currentAmount: goal.currentAmount,
              targetAmount: goal.targetAmount,
              percentComplete,
              currency,
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
