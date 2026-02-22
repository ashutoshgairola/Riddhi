import { Db } from 'mongodb';

import { BudgetModel } from '../../budgets/db';
import { getErrorMessage } from '../../common/utils';
import { createChildLogger } from '../../config/logger';
import { NotificationLogModel } from '../../notifications/db';
import { NotificationService } from '../../notifications/service';
import { JobResult } from '../types/interface';

const logger = createChildLogger({ job: 'BudgetAlerts' });

const THRESHOLDS = [80, 100]; // percentage triggers
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours between repeat alerts per category

/**
 * Scans all active budgets and fires alerts when category spend crosses 80% or 100%.
 *
 * Dedup: Won't re-alert the same user+budget+category+threshold within 24 hours.
 *
 * Runs daily at 8:00 AM.
 */
export function createBudgetAlertsJob(db: Db, notificationService: NotificationService) {
  const budgetModel = new BudgetModel(db);
  const notificationLogModel = new NotificationLogModel(db);

  return async (): Promise<JobResult> => {
    const errors: string[] = [];
    let processedCount = 0;

    try {
      const now = new Date();

      // Find all budgets that overlap with today
      const activeBudgets = await budgetModel.collection
        .find({
          startDate: { $lte: now },
          endDate: { $gte: now },
        })
        .toArray();

      logger.info({ count: activeBudgets.length }, 'Scanning active budgets for alerts');

      for (const budget of activeBudgets) {
        const categories = budget.categories || [];

        for (const category of categories) {
          try {
            if (!category.allocated || category.allocated <= 0) continue;

            const percentUsed = Math.round((category.spent / category.allocated) * 100);

            // Check each threshold
            for (const threshold of THRESHOLDS) {
              if (percentUsed < threshold) continue;

              // Dedup check: has this exact alert been sent recently?
              const dedupeKey = `budget_alert:${budget._id}:${category.categoryIds?.[0] ?? category.name}:${threshold}`;

              const recentAlert = await notificationLogModel.findRecentByDedupeKey(
                budget.userId,
                'budget_alert',
                'sent',
                dedupeKey,
                new Date(Date.now() - COOLDOWN_MS),
              );

              if (recentAlert) continue; // already notified

              await notificationService.send({
                userId: budget.userId,
                payload: {
                  type: 'budget_alert',
                  userName: '',
                  budgetName: budget.name || 'Budget',
                  categoryName: category.name,
                  spent: Math.round(category.spent * 100) / 100,
                  allocated: Math.round(category.allocated * 100) / 100,
                  percentUsed,
                  currency: '₹', // TODO: pull from user preferences
                },
              });

              processedCount++;

              logger.info(
                {
                  userId: budget.userId,
                  budgetId: budget._id?.toString() ?? '',
                  category: category.categoryIds?.[0] ?? category.name,
                  percentUsed,
                  threshold,
                },
                'Budget alert sent',
              );

              // Only fire the highest crossed threshold per category
              break;
            }
          } catch (error: unknown) {
            const msg = `Failed alert for budget ${budget._id} category ${category.categoryIds?.[0] ?? category.name}: ${getErrorMessage(error)}`;
            logger.error({ error }, msg);
            errors.push(msg);
          }
        }
      }
    } catch (error: unknown) {
      logger.error({ error }, 'Budget alerts job failed');
      errors.push(`Job-level error: ${getErrorMessage(error)}`);
    }

    return {
      processedCount,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  };
}
