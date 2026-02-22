import { MonthlyReportPayload } from '../types/interface';
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

export function monthlyReportEmail(
  payload: MonthlyReportPayload,
): { subject: string; html: string } {
  const savingsColor = payload.netSavings >= 0 ? COLORS.green600 : COLORS.red600;
  const savingsSign = payload.netSavings >= 0 ? '+' : '';

  const subject = `📈 Your ${payload.month} financial summary`;

  // Build top categories list
  const categoriesHtml = payload.topCategories
    .slice(0, 5)
    .map(
      (cat, i) => `
      <tr>
        <td style="padding:10px 0; border-top:1px solid ${COLORS.gray200};">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="width:24px;">
                <div style="width:20px; height:20px; border-radius:50%; background-color:${COLORS.green50}; text-align:center; line-height:20px; font-size:11px; color:${COLORS.green800}; font-weight:600;">${i + 1}</div>
              </td>
              <td style="padding-left:12px; font-size:14px; color:${COLORS.gray900}; font-weight:500;">${cat.name}</td>
              <td style="text-align:right; font-size:14px; color:${COLORS.gray700}; font-weight:600;">${payload.currency}${cat.amount.toLocaleString()}</td>
            </tr>
          </table>
        </td>
      </tr>`,
    )
    .join('');

  const content = `
    ${accentBar()}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${section(`
          ${heading(`${payload.month} Summary`)}
          ${subtext(`Hi ${payload.userName}, here's your monthly financial overview.`)}

          <!-- Key metrics -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="8" style="margin:8px 0;">
            <tr>
              ${metricBox('Income', `${payload.currency}${payload.totalIncome.toLocaleString()}`, COLORS.green600)}
              ${metricBox('Expenses', `${payload.currency}${payload.totalExpenses.toLocaleString()}`)}
              ${metricBox('Net Savings', `${savingsSign}${payload.currency}${Math.abs(payload.netSavings).toLocaleString()}`, savingsColor)}
            </tr>
          </table>

          <!-- Budget utilization bar -->
          <div style="margin:20px 0 8px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:13px; color:${COLORS.gray500};">Budget Utilization</td>
                <td style="font-size:13px; color:${COLORS.gray900}; font-weight:600; text-align:right;">${payload.budgetUtilization}%</td>
              </tr>
            </table>
            <div style="background-color:${COLORS.gray100}; border-radius:6px; height:8px; overflow:hidden; margin-top:6px;">
              <div style="background:linear-gradient(90deg, ${COLORS.green600}, ${payload.budgetUtilization > 90 ? COLORS.red600 : COLORS.green800}); height:8px; border-radius:6px; width:${Math.min(100, payload.budgetUtilization)}%;"></div>
            </div>
          </div>

          ${divider()}

          <!-- Top spending categories -->
          <h2 style="margin:0 0 4px 0; font-size:16px; font-weight:700; color:${COLORS.gray900};">Top Spending Categories</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${categoriesHtml}
          </table>

          ${divider()}

          ${payload.netSavings >= 0
            ? paragraph(`Great month! You saved <strong>${payload.currency}${payload.netSavings.toLocaleString()}</strong>. Keep up the positive trend.`)
            : paragraph(`You spent <strong>${payload.currency}${Math.abs(payload.netSavings).toLocaleString()}</strong> more than you earned this month. Consider reviewing your spending categories.`)
          }

          ${ctaButton('View Full Report', '{{reportUrl}}')}
        `)}
      </tr>
    </table>`;

  return { subject, html: emailLayout(content, subject) };
}

export function monthlyReportSms(payload: MonthlyReportPayload): string {
  const savingsSign = payload.netSavings >= 0 ? '+' : '-';
  return `FinTrack: ${payload.month} summary — Income: ${payload.currency}${payload.totalIncome.toLocaleString()}, Expenses: ${payload.currency}${payload.totalExpenses.toLocaleString()}, Net: ${savingsSign}${payload.currency}${Math.abs(payload.netSavings).toLocaleString()}. View details in the app.`;
}
