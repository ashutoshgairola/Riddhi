import { createChildLogger } from '../../config/logger';
import { EmailPayload, SmsPayload } from '../types/interface';

const logger = createChildLogger({ provider: 'BrevoProvider' });

/**
 * Brevo (formerly Sendinblue) — single free service for both Email and SMS.
 *
 * Free tier: 300 emails/day, SMS with purchased credits.
 * API docs: https://developers.brevo.com/reference
 *
 * Required env vars:
 *   BREVO_API_KEY        — API key from https://app.brevo.com/settings/keys/api
 *   BREVO_SENDER_EMAIL   — Verified sender email (e.g. notifications@yourapp.com)
 *   BREVO_SENDER_NAME    — Display name (e.g. "FinTrack")
 *   BREVO_SMS_SENDER     — SMS sender name (max 11 alphanumeric chars, e.g. "FinTrack")
 */

const BREVO_API_URL = 'https://api.brevo.com/v3';

function getHeaders(): Record<string, string> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is not set');
  }

  return {
    'api-key': apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@fintrack.app';
  const senderName = process.env.BREVO_SENDER_NAME || 'FinTrack';

  const body = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: payload.to }],
    subject: payload.subject,
    htmlContent: payload.html,
  };

  logger.info({ to: payload.to, subject: payload.subject }, 'Sending email via Brevo');

  const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error({ status: response.status, errorBody }, 'Brevo email send failed');
    throw new Error(`Brevo email failed: ${response.status} — ${errorBody}`);
  }

  logger.info({ to: payload.to }, 'Email sent successfully');
}

export async function sendSms(payload: SmsPayload): Promise<void> {
  const sender = process.env.BREVO_SMS_SENDER || 'FinTrack';

  const body = {
    type: 'transactional',
    sender,
    recipient: payload.to,
    content: payload.message,
  };

  logger.info({ to: payload.to }, 'Sending SMS via Brevo');

  const response = await fetch(`${BREVO_API_URL}/transactionalSMS/sms`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error({ status: response.status, errorBody }, 'Brevo SMS send failed');
    throw new Error(`Brevo SMS failed: ${response.status} — ${errorBody}`);
  }

  logger.info({ to: payload.to }, 'SMS sent successfully');
}
