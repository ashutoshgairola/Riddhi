import { BudgetAlertPayload } from '../types/interface';
import {
  accentBar,
  COLORS,
  ctaButton,
  divider,
  emailLayout,
  heading,
  metricBox,
  paragraph,
  section,
  subtext,
} from './layout';

export function budgetAlertEmail(payload: BudgetAlertPayload): { subject: string; html: string } {
  const isOverBudget = payload.percentUsed >= 100;
  const statusColor = isOverBudget ? COLORS.red600 : '#f59e0b'; // amber for warning
  const statusLabel = isOverBudget ? 'Over Budget' : 'Approaching Limit';
  const remaining = Math.max(0, payload.allocated - payload.spent);

  const subject = isOverBudget
    ? `🚨 Budget exceeded: ${payload.categoryName}`
    : `⚠️ Budget alert: ${payload.categoryName} at ${payload.percentUsed}%`;

  const content = `
    ${accentBar()}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${section(`
          ${heading('Budget Alert')}
          ${subtext(`Hi ${payload.userName}, here's an update on your spending.`)}

          <!-- Status badge -->
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr>
              <td style="background-color:${statusColor}; border-radius:20px; padding:6px 16px;">
                <span style="color:#ffffff; font-size:13px; font-weight:600;">${statusLabel}</span>
              </td>
            </tr>
          </table>

          ${paragraph(`<strong>${payload.categoryName}</strong> in your <strong>${payload.budgetName}</strong> budget has reached <strong>${payload.percentUsed}%</strong> of its allocated amount.`)}

          <!-- Metrics -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="8" style="margin:8px 0 16px 0;">
            <tr>
              ${metricBox('Spent', `${payload.currency}${payload.spent.toLocaleString()}`)}
              ${metricBox('Budget', `${payload.currency}${payload.allocated.toLocaleString()}`)}
              ${metricBox('Remaining', `${payload.currency}${remaining.toLocaleString()}`, isOverBudget ? COLORS.red600 : COLORS.green600)}
            </tr>
          </table>

          <!-- Progress bar -->
          <div style="background-color:${COLORS.gray100}; border-radius:8px; height:10px; overflow:hidden; margin:16px 0;">
            <div style="background-color:${statusColor}; height:10px; border-radius:8px; width:${Math.min(100, payload.percentUsed)}%;"></div>
          </div>

          ${divider()}

          ${paragraph('Review your recent transactions and adjust your spending to stay on track.')}

          ${ctaButton('View Budget Details', '{{budgetUrl}}')}
        `)}
      </tr>
    </table>`;

  return { subject, html: emailLayout(content, subject) };
}

export function budgetAlertSms(payload: BudgetAlertPayload): string {
  const isOverBudget = payload.percentUsed >= 100;
  const remaining = Math.max(0, payload.allocated - payload.spent);

  if (isOverBudget) {
    return `FinTrack: ⚠️ You've exceeded your ${payload.categoryName} budget (${payload.currency}${payload.spent} of ${payload.currency}${payload.allocated}). Review spending in the app.`;
  }

  return `FinTrack: ${payload.categoryName} budget is at ${payload.percentUsed}%. ${payload.currency}${remaining} remaining of ${payload.currency}${payload.allocated}.`;
}
