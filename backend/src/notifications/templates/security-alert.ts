import { SecurityAlertPayload } from '../types/interface';
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

export function securityAlertEmail(
  payload: SecurityAlertPayload,
): { subject: string; html: string } {
  const subject = `🔒 Security alert: ${payload.event}`;

  const content = `
    ${accentBar()}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${section(`
          ${heading('Security Alert')}
          ${subtext(`Hi ${payload.userName}, we detected activity on your account.`)}

          <!-- Alert card -->
          <div style="background-color:#fef2f2; border-radius:10px; padding:20px 24px; margin:16px 0; border-left:4px solid ${COLORS.red600};">
            <div style="font-size:15px; font-weight:600; color:${COLORS.gray900}; margin-bottom:12px;">${payload.event}</div>

            <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr>
                <td style="padding:4px 0; color:${COLORS.gray500}; width:100px;">Time</td>
                <td style="padding:4px 0; color:${COLORS.gray900}; font-weight:500;">${payload.timestamp}</td>
              </tr>
              ${payload.ipAddress ? `
              <tr>
                <td style="padding:4px 0; color:${COLORS.gray500};">IP Address</td>
                <td style="padding:4px 0; color:${COLORS.gray900}; font-weight:500; font-family:monospace; font-size:13px;">${payload.ipAddress}</td>
              </tr>` : ''}
              ${payload.location ? `
              <tr>
                <td style="padding:4px 0; color:${COLORS.gray500};">Location</td>
                <td style="padding:4px 0; color:${COLORS.gray900}; font-weight:500;">${payload.location}</td>
              </tr>` : ''}
            </table>
          </div>

          ${divider()}

          ${paragraph('If this was you, no action is needed. If you don\'t recognize this activity, secure your account immediately.')}

          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:12px;">
                ${ctaButton('Secure My Account', '{{securityUrl}}')}
              </td>
            </tr>
          </table>

          <div style="margin-top:16px; padding:14px 18px; background-color:${COLORS.gray50}; border-radius:8px;">
            <p style="margin:0; font-size:13px; color:${COLORS.gray600}; line-height:1.5;">
              <strong>Tip:</strong> Enable two-factor authentication for additional security. You can do this in Settings → Security.
            </p>
          </div>
        `)}
      </tr>
    </table>`;

  return { subject, html: emailLayout(content, subject) };
}

export function securityAlertSms(payload: SecurityAlertPayload): string {
  const locationInfo = payload.location ? ` from ${payload.location}` : '';
  return `FinTrack Security: ${payload.event}${locationInfo} at ${payload.timestamp}. If this wasn't you, secure your account immediately.`;
}
