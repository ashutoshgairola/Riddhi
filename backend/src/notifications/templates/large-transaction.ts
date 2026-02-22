import { LargeTransactionPayload } from '../types/interface';
import {
  accentBar,
  COLORS,
  ctaButton,
  divider,
  emailLayout,
  heading,
  paragraph,
  section,
  subtext,
} from './layout';

export function largeTransactionEmail(
  payload: LargeTransactionPayload,
): { subject: string; html: string } {
  const isExpense = payload.transactionType === 'expense';
  const amountColor = isExpense ? COLORS.red600 : COLORS.green600;
  const sign = isExpense ? '-' : '+';

  const subject = isExpense
    ? `💸 Large expense: ${payload.currency}${payload.amount.toLocaleString()}`
    : `💰 Large deposit: ${payload.currency}${payload.amount.toLocaleString()}`;

  const content = `
    ${accentBar()}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${section(`
          ${heading('Large Transaction Detected')}
          ${subtext(`Hi ${payload.userName}, we noticed an unusually large transaction.`)}

          <!-- Transaction card -->
          <div style="background-color:${COLORS.gray50}; border-radius:10px; padding:24px; margin:16px 0;">
            <!-- Amount -->
            <div style="text-align:center; margin-bottom:20px;">
              <div style="font-size:36px; font-weight:700; color:${amountColor}; line-height:1;">
                ${sign}${payload.currency}${payload.amount.toLocaleString()}
              </div>
              <div style="font-size:13px; color:${COLORS.gray500}; margin-top:6px; text-transform:uppercase; letter-spacing:0.05em;">
                ${payload.transactionType}
              </div>
            </div>

            <!-- Details table -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr>
                <td style="padding:10px 0; border-top:1px solid ${COLORS.gray200}; color:${COLORS.gray500}; width:120px;">Description</td>
                <td style="padding:10px 0; border-top:1px solid ${COLORS.gray200}; color:${COLORS.gray900}; font-weight:500;">${payload.description}</td>
              </tr>
              <tr>
                <td style="padding:10px 0; border-top:1px solid ${COLORS.gray200}; color:${COLORS.gray500};">Account</td>
                <td style="padding:10px 0; border-top:1px solid ${COLORS.gray200}; color:${COLORS.gray900}; font-weight:500;">${payload.accountName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0; border-top:1px solid ${COLORS.gray200}; color:${COLORS.gray500};">Date</td>
                <td style="padding:10px 0; border-top:1px solid ${COLORS.gray200}; color:${COLORS.gray900}; font-weight:500;">${payload.date}</td>
              </tr>
            </table>
          </div>

          ${divider()}

          ${paragraph('If you don\'t recognize this transaction, review it immediately and take appropriate action.')}

          ${ctaButton('Review Transaction', '{{transactionUrl}}')}
        `)}
      </tr>
    </table>`;

  return { subject, html: emailLayout(content, subject) };
}

export function largeTransactionSms(payload: LargeTransactionPayload): string {
  const sign = payload.transactionType === 'expense' ? '-' : '+';
  return `FinTrack: Large ${payload.transactionType} detected — ${sign}${payload.currency}${payload.amount.toLocaleString()} for "${payload.description}" on ${payload.accountName}. Review in the app.`;
}
