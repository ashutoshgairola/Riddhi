import dayjs from 'dayjs';
import { Db } from 'mongodb';

import { BudgetModel } from '../../budgets/db';
import { getErrorMessage } from '../../common/utils';
import { createChildLogger } from '../../config/logger';
import { NotificationService } from '../../notifications/service';
import { CategoryModel } from '../../transactions/category-db';
import { TransactionModel } from '../../transactions/db';
import { JobResult } from '../types/interface';

const logger = createChildLogger({ job: 'MonthlyReports' });

/**
 * Generates and sends monthly financial summary reports.
 *
 * Runs on the 1st of each month at 6:00 AM.
 *
 * For each user who has the "Monthly Reports" notification enabled:
 * 1. Aggregate all transactions from the previous month
 * 2. Compute income, expenses, net savings
 * 3. Rank top spending categories
 * 4. Compute budget utilization
 * 5. Send monthly_report notification
 */
export function createMonthlyReportsJob(db: Db, notificationService: NotificationService) {
  const transactionModel = new TransactionModel(db);
  const budgetModel = new BudgetModel(db);
  const categoryModel = new CategoryModel(db);

  return async (): Promise<JobResult> => {
    const errors: string[] = [];
    let processedCount = 0;

    try {
      const now = dayjs();
      const prevMonthStart = now.subtract(1, 'month').startOf('month').toDate();
      const prevMonthEnd = now.subtract(1, 'month').endOf('month').toDate();
      const monthLabel = dayjs(prevMonthStart).format('MMMM YYYY');

      // Get distinct userIds that had transactions last month
      const userIds = await transactionModel.collection.distinct('userId', {
        date: { $gte: prevMonthStart, $lte: prevMonthEnd },
      });

      logger.info({ count: userIds.length, month: monthLabel }, 'Generating monthly reports');

      for (const userId of userIds) {
        try {
          // Fetch all transactions for the previous month
          const transactions = await transactionModel.findByDateRange(
            userId,
            prevMonthStart,
            prevMonthEnd,
          );

          if (transactions.length === 0) continue;

          // Compute totals
          let totalIncome = 0;
          let totalExpenses = 0;
          const categorySpending: Record<string, number> = {};

          for (const tx of transactions) {
            if (tx.type === 'income') {
              totalIncome += tx.amount;
            } else if (tx.type === 'expense') {
              totalExpenses += tx.amount;

              // Track category spending
              const catKey = tx.categoryId || 'uncategorized';
              categorySpending[catKey] = (categorySpending[catKey] || 0) + tx.amount;
            }
          }

          const netSavings = totalIncome - totalExpenses;

          // Resolve top categories by name
          const sortedCatIds = Object.entries(categorySpending)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

          const categoryIds = sortedCatIds.map(([id]) => id).filter((id) => id !== 'uncategorized');

          const categories =
            categoryIds.length > 0 ? await categoryModel.findByIds(categoryIds, userId) : [];

          const categoryNameMap: Record<string, string> = {};
          for (const cat of categories) {
            categoryNameMap[cat._id?.toString() ?? ''] = cat.name;
          }

          const topCategories = sortedCatIds.map(([id, amount]) => ({
            name: categoryNameMap[id] || (id === 'uncategorized' ? 'Uncategorized' : 'Unknown'),
            amount: Math.round(amount * 100) / 100,
          }));

          // Compute budget utilization
          let budgetUtilization = 0;
          try {
            const budgets = await budgetModel.collection
              .find({
                userId,
                startDate: { $lte: prevMonthEnd },
                endDate: { $gte: prevMonthStart },
              })
              .toArray();

            if (budgets.length > 0) {
              const totalAllocated = budgets.reduce((sum, b) => sum + (b.totalAllocated || 0), 0);
              const totalSpent = budgets.reduce((sum, b) => sum + (b.totalSpent || 0), 0);
              budgetUtilization =
                totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
            }
          } catch {
            // Budget data is optional — continue without it
          }

          // Send notification
          await notificationService.send({
            userId,
            payload: {
              type: 'monthly_report',
              userName: '', // populated by notification service or left for template
              month: monthLabel,
              totalIncome: Math.round(totalIncome * 100) / 100,
              totalExpenses: Math.round(totalExpenses * 100) / 100,
              netSavings: Math.round(netSavings * 100) / 100,
              topCategories,
              currency: '₹', // TODO: pull from user preferences
              budgetUtilization,
            },
          });

          processedCount++;

          logger.info(
            { userId, income: totalIncome, expenses: totalExpenses, net: netSavings },
            'Monthly report sent',
          );
        } catch (error: unknown) {
          const msg = `Failed to generate report for user ${userId}: ${getErrorMessage(error)}`;
          logger.error({ error, userId }, msg);
          errors.push(msg);
        }
      }
    } catch (error: unknown) {
      logger.error({ error }, 'Monthly reports job failed');
      errors.push(`Job-level error: ${getErrorMessage(error)}`);
    }

    return {
      processedCount,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      metadata: { month: dayjs().subtract(1, 'month').format('MMMM YYYY') },
    };
  };
}
