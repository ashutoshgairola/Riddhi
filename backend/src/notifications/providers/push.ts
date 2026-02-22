import webpush from 'web-push';

import { createChildLogger } from '../../config/logger';
import { PushPayload } from '../types/interface';

const logger = createChildLogger({ provider: 'PushProvider' });

/**
 * Web Push notifications via the web-push library.
 *
 * Required env vars:
 *   VAPID_PUBLIC_KEY   — Generate with: npx web-push generate-vapid-keys
 *   VAPID_PRIVATE_KEY
 *   VAPID_SUBJECT      — mailto:your@email.com or https://yoursite.com
 *
 * Install: npm install web-push
 */

let initialized = false;

function ensureInitialized(): void {
  if (initialized) return;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@fintrack.app';

  if (!publicKey || !privateKey) {
    throw new Error('VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables are required');
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  initialized = true;
}

export async function sendPush(payload: PushPayload): Promise<void> {
  ensureInitialized();

  const subscription = {
    endpoint: payload.subscription.endpoint,
    keys: payload.subscription.keys,
  };

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    data: { url: payload.url || '/' },
  });

  logger.info({ endpoint: subscription.endpoint.slice(0, 60) }, 'Sending push notification');

  try {
    await webpush.sendNotification(subscription, notificationPayload);
    logger.info('Push notification sent successfully');
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 410 || statusCode === 404) {
      logger.warn('Push subscription expired or invalid');
      throw new Error('Push subscription expired');
    }
    logger.error({ error }, 'Push notification failed');
    throw error;
  }
}
