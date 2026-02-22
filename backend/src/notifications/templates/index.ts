import { NotificationPayload } from '../types/interface';
import { budgetAlertEmail, budgetAlertSms } from './budget-alert';
import { goalProgressEmail, goalProgressSms } from './goal-progress';
import { largeTransactionEmail, largeTransactionSms } from './large-transaction';
import { monthlyReportEmail, monthlyReportSms } from './monthly-report';
import { securityAlertEmail, securityAlertSms } from './security-alert';

export function renderEmail(payload: NotificationPayload): { subject: string; html: string } {
  switch (payload.type) {
    case 'budget_alert':
      return budgetAlertEmail(payload);
    case 'goal_progress':
      return goalProgressEmail(payload);
    case 'large_transaction':
      return largeTransactionEmail(payload);
    case 'monthly_report':
      return monthlyReportEmail(payload);
    case 'security_alert':
      return securityAlertEmail(payload);
    default:
      throw new Error(`Unknown notification type: ${(payload as { type: string }).type}`);
  }
}

export function renderSms(payload: NotificationPayload): string {
  switch (payload.type) {
    case 'budget_alert':
      return budgetAlertSms(payload);
    case 'goal_progress':
      return goalProgressSms(payload);
    case 'large_transaction':
      return largeTransactionSms(payload);
    case 'monthly_report':
      return monthlyReportSms(payload);
    case 'security_alert':
      return securityAlertSms(payload);
    default:
      throw new Error(`Unknown notification type: ${(payload as { type: string }).type}`);
  }
}

/** Push notification title + body (short-form for OS-level notification) */
export function renderPush(payload: NotificationPayload): { title: string; body: string } {
  switch (payload.type) {
    case 'budget_alert':
      return {
        title: `Budget Alert: ${payload.categoryName}`,
        body: `${payload.percentUsed}% of your ${payload.categoryName} budget used (${payload.currency}${payload.spent} / ${payload.currency}${payload.allocated})`,
      };
    case 'goal_progress':
      return {
        title:
          payload.percentComplete >= 100
            ? `🎉 Goal Achieved: ${payload.goalName}`
            : `Goal Update: ${payload.goalName}`,
        body: `${payload.percentComplete}% complete — ${payload.currency}${payload.currentAmount.toLocaleString()} of ${payload.currency}${payload.targetAmount.toLocaleString()}`,
      };
    case 'large_transaction': {
      const sign = payload.transactionType === 'expense' ? '-' : '+';
      return {
        title: `Large ${payload.transactionType}: ${sign}${payload.currency}${payload.amount.toLocaleString()}`,
        body: `${payload.description} on ${payload.accountName}`,
      };
    }
    case 'monthly_report':
      return {
        title: `${payload.month} Summary Ready`,
        body: `Income: ${payload.currency}${payload.totalIncome.toLocaleString()} | Expenses: ${payload.currency}${payload.totalExpenses.toLocaleString()}`,
      };
    case 'security_alert':
      return {
        title: '🔒 Security Alert',
        body: payload.event,
      };
    default:
      return { title: 'FinTrack', body: 'You have a new notification.' };
  }
}
