import { GoalProgressPayload } from '../types/interface';
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

export function goalProgressEmail(payload: GoalProgressPayload): { subject: string; html: string } {
  const isComplete = payload.percentComplete >= 100;
  const subject = isComplete
    ? `🎉 Goal achieved: ${payload.goalName}!`
    : `📊 Goal update: ${payload.goalName} — ${payload.percentComplete}% complete`;

  const remaining = Math.max(0, payload.targetAmount - payload.currentAmount);

  const content = `
    ${accentBar()}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${section(`
          ${isComplete
            ? heading('🎉 Goal Achieved!')
            : heading('Goal Progress Update')
          }
          ${subtext(`Hi ${payload.userName}, here's how you're doing.`)}

          <!-- Goal name card -->
          <div style="background-color:${COLORS.green50}; border-radius:10px; padding:16px 20px; margin-bottom:20px; border-left:4px solid ${COLORS.green600};">
            <div style="font-size:17px; font-weight:700; color:${COLORS.green800};">${payload.goalName}</div>
            ${payload.projectedDate
              ? `<div style="font-size:13px; color:${COLORS.gray500}; margin-top:4px;">Projected completion: ${payload.projectedDate}</div>`
              : ''
            }
          </div>

          <!-- Metrics -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="8" style="margin:8px 0 16px 0;">
            <tr>
              ${metricBox('Saved', `${payload.currency}${payload.currentAmount.toLocaleString()}`, COLORS.green600)}
              ${metricBox('Target', `${payload.currency}${payload.targetAmount.toLocaleString()}`)}
              ${metricBox('Remaining', `${payload.currency}${remaining.toLocaleString()}`)}
            </tr>
          </table>

          <!-- Progress bar -->
          <div style="background-color:${COLORS.gray100}; border-radius:8px; height:12px; overflow:hidden; margin:16px 0;">
            <div style="background:linear-gradient(90deg, ${COLORS.green600}, ${COLORS.green800}); height:12px; border-radius:8px; width:${Math.min(100, payload.percentComplete)}%;"></div>
          </div>
          <div style="text-align:center; font-size:14px; font-weight:600; color:${COLORS.green600}; margin-bottom:16px;">
            ${payload.percentComplete}% complete
          </div>

          ${divider()}

          ${isComplete
            ? paragraph('Congratulations! You\'ve reached your savings goal. Time to set your next milestone!')
            : paragraph('Keep up the great work! Consistent contributions will get you there.')
          }

          ${ctaButton(isComplete ? 'Set New Goal' : 'View Goal Details', '{{goalUrl}}')}
        `)}
      </tr>
    </table>`;

  return { subject, html: emailLayout(content, subject) };
}

export function goalProgressSms(payload: GoalProgressPayload): string {
  if (payload.percentComplete >= 100) {
    return `FinTrack: 🎉 You've reached your "${payload.goalName}" goal! ${payload.currency}${payload.targetAmount.toLocaleString()} saved. Set your next goal in the app.`;
  }

  const remaining = payload.targetAmount - payload.currentAmount;
  return `FinTrack: "${payload.goalName}" is ${payload.percentComplete}% complete. ${payload.currency}${remaining.toLocaleString()} to go. Keep it up!`;
}
