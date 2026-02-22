import dayjs from 'dayjs';
import { Db } from 'mongodb';

import { getErrorMessage } from '../../common/utils';
import { createChildLogger } from '../../config/logger';
import { TransactionModel } from '../../transactions/db';
import { JobResult, RecurringFrequency } from '../types/interface';

const logger = createChildLogger({ job: 'RecurringTransactions' });

/**
 * Processes recurring transactions.
 *
 * Logic:
 * 1. Find all transactions where isRecurring = true
 * 2. Group by recurringId to get the "template" (most recent instance)
 * 3. Check if a new instance is due based on recurringFrequency + last instance date
 * 4. Create the new transaction instance with today's date
 *
 * Runs daily at 1:00 AM — the frequency check handles weekly/biweekly/monthly internally.
 */
export function createRecurringTransactionsJob(db: Db) {
  const transactionModel = new TransactionModel(db);

  return async (): Promise<JobResult> => {
    const errors: string[] = [];
    let processedCount = 0;

    try {
      const today = dayjs().startOf('day');

      // Find all distinct recurringIds that have isRecurring = true
      const recurringTemplates = await transactionModel.collection
        .aggregate<{
          _id: string;
          userId: string;
          latestDate: Date;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          template: any;
        }>([
          { $match: { isRecurring: true, recurringId: { $exists: true, $ne: null } } },
          { $sort: { date: -1 } },
          {
            $group: {
              _id: '$recurringId',
              userId: { $first: '$userId' },
              latestDate: { $first: '$date' },
              template: { $first: '$$ROOT' },
            },
          },
        ])
        .toArray();

      logger.info({ count: recurringTemplates.length }, 'Found recurring transaction templates');

      for (const group of recurringTemplates) {
        try {
          const { template, latestDate } = group;
          const frequency: RecurringFrequency = template.recurringFrequency || 'monthly';

          const nextDueDate = calculateNextDueDate(dayjs(latestDate), frequency);

          // Only create if due today or overdue (but not future)
          if (nextDueDate.isAfter(today)) {
            continue;
          }

          // Create the new transaction instance
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, createdAt, updatedAt, ...templateFields } = template;

          await transactionModel.create({
            ...templateFields,
            date: today.toDate(),
            status: 'pending',
            notes: template.notes
              ? `${template.notes} (auto-recurring)`
              : 'Auto-recurring transaction',
          });

          processedCount++;

          logger.info(
            { recurringId: group._id, userId: group.userId, frequency },
            'Created recurring transaction instance',
          );
        } catch (error: unknown) {
          const msg = `Failed to process recurring template ${group._id}: ${getErrorMessage(error)}`;
          logger.error({ error, recurringId: group._id }, msg);
          errors.push(msg);
        }
      }
    } catch (error: unknown) {
      logger.error({ error }, 'Recurring transactions job failed');
      errors.push(`Job-level error: ${getErrorMessage(error)}`);
    }

    return {
      processedCount,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  };
}

function calculateNextDueDate(lastDate: dayjs.Dayjs, frequency: RecurringFrequency): dayjs.Dayjs {
  switch (frequency) {
    case 'daily':
      return lastDate.add(1, 'day');
    case 'weekly':
      return lastDate.add(1, 'week');
    case 'biweekly':
      return lastDate.add(2, 'week');
    case 'monthly':
      return lastDate.add(1, 'month');
    case 'yearly':
      return lastDate.add(1, 'year');
    default:
      return lastDate.add(1, 'month');
  }
}
