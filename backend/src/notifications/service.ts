import { Db } from 'mongodb';

import { getErrorMessage } from '../common/utils';
import { createChildLogger } from '../config/logger';
import { NotificationSettingModel } from '../settings/notification-settings-db';
import { NotificationLogModel } from './db';
import { sendEmail, sendSms } from './providers/brevo';
import { sendPush } from './providers/push';
import { PushSubscriptionModel } from './push-subscription-db';
import { renderEmail, renderPush, renderSms } from './templates';
import {
  NotificationChannel,
  NotificationType,
  SendNotificationOptions,
  TYPE_TO_SETTING_NAME,
} from './types/interface';

export class NotificationService {
  private logModel: NotificationLogModel;
  private settingsModel: NotificationSettingModel;
  private pushSubModel: PushSubscriptionModel;
  private logger = createChildLogger({ service: 'NotificationService' });

  constructor(db: Db) {
    this.logModel = new NotificationLogModel(db);
    this.settingsModel = new NotificationSettingModel(db);
    this.pushSubModel = new PushSubscriptionModel(db);
  }

  async initialize(): Promise<void> {
    await this.logModel.initialize();
    await this.pushSubModel.initialize();
  }

  /**
   * Send a notification across all enabled channels based on user preferences.
   *
   * Usage:
   * ```ts
   * await notificationService.send({
   *   userId: '...',
   *   email: 'user@example.com',
   *   phone: '+911234567890',
   *   pushSubscription: { endpoint: '...', keys: { p256dh: '...', auth: '...' } },
   *   payload: {
   *     type: 'budget_alert',
   *     userName: 'Ashutosh',
   *     budgetName: 'February 2026',
   *     categoryName: 'Dining',
   *     spent: 4500,
   *     allocated: 5000,
   *     percentUsed: 90,
   *     currency: '₹',
   *   },
   * });
   * ```
   */
  async send(options: SendNotificationOptions): Promise<void> {
    const { userId, payload } = options;
    const notificationType: NotificationType = payload.type;

    // Look up user's channel preferences for this notification type
    const enabledChannels = await this.getEnabledChannels(userId, notificationType);

    if (enabledChannels.length === 0) {
      this.logger.info(
        { userId, type: notificationType },
        'All channels disabled for this notification type, skipping',
      );
      return;
    }

    // Dispatch to each enabled channel concurrently
    const dispatches: Promise<void>[] = [];

    if (enabledChannels.includes('email') && options.email) {
      dispatches.push(this.sendEmailNotification(userId, notificationType, options.email, payload));
    }

    if (enabledChannels.includes('sms') && options.phone) {
      dispatches.push(this.sendSmsNotification(userId, notificationType, options.phone, payload));
    }

    if (enabledChannels.includes('push') && options.pushSubscription) {
      dispatches.push(
        this.sendPushNotification(userId, notificationType, options.pushSubscription, payload),
      );
    } else if (enabledChannels.includes('push') && !options.pushSubscription) {
      // Fall back to all stored subscriptions for this user
      const storedSubs = await this.pushSubModel.findByUserId(userId);
      for (const sub of storedSubs) {
        dispatches.push(
          this.sendPushNotification(
            userId,
            notificationType,
            { endpoint: sub.endpoint, keys: sub.keys },
            payload,
          ),
        );
      }
    }

    // Wait for all dispatches — don't throw if individual channels fail
    await Promise.allSettled(dispatches);
  }

  /**
   * Determine which channels are enabled for a notification type.
   */
  private async getEnabledChannels(
    userId: string,
    type: NotificationType,
  ): Promise<NotificationChannel[]> {
    const settingName = TYPE_TO_SETTING_NAME[type];
    if (!settingName) {
      this.logger.warn({ type }, 'Unknown notification type, sending on all channels');
      return ['email', 'push', 'sms'];
    }

    const settings = await this.settingsModel.findByUserId(userId);
    const setting = settings.find((s) => s.name === settingName);

    if (!setting) {
      // No settings found — create defaults and re-check
      const defaults = await this.settingsModel.createDefaultSettings(userId);
      const defaultSetting = defaults.find((s) => s.name === settingName);

      if (!defaultSetting) {
        return ['email', 'push']; // safe fallback
      }

      return this.channelsFromSetting(defaultSetting);
    }

    return this.channelsFromSetting(setting);
  }

  private channelsFromSetting(setting: {
    email: boolean;
    push: boolean;
    sms: boolean;
  }): NotificationChannel[] {
    const channels: NotificationChannel[] = [];
    if (setting.email) channels.push('email');
    if (setting.push) channels.push('push');
    if (setting.sms) channels.push('sms');
    return channels;
  }

  // ── Channel dispatchers ───────────────────────────────────────────────────

  private async sendEmailNotification(
    userId: string,
    type: NotificationType,
    email: string,
    payload: SendNotificationOptions['payload'],
  ): Promise<void> {
    const log = await this.logModel.create({
      userId,
      type,
      channel: 'email',
      subject: '',
      status: 'pending',
      createdAt: new Date(),
    });

    try {
      const { subject, html } = renderEmail(payload);

      // Update log with subject
      await this.logModel.updateStatus(log._id?.toString() ?? '', 'pending');

      await sendEmail({ to: email, subject, html });

      await this.logModel.updateStatus(log._id?.toString() ?? '', 'sent');

      this.logger.info({ userId, type, channel: 'email' }, 'Email notification sent');
    } catch (error: unknown) {
      await this.logModel.updateStatus(log._id?.toString() ?? '', 'failed', getErrorMessage(error));
      this.logger.error({ userId, type, channel: 'email', error }, 'Email notification failed');
    }
  }

  private async sendSmsNotification(
    userId: string,
    type: NotificationType,
    phone: string,
    payload: SendNotificationOptions['payload'],
  ): Promise<void> {
    const log = await this.logModel.create({
      userId,
      type,
      channel: 'sms',
      subject: TYPE_TO_SETTING_NAME[type],
      status: 'pending',
      createdAt: new Date(),
    });

    try {
      const message = renderSms(payload);

      await sendSms({ to: phone, message });

      await this.logModel.updateStatus(log._id!.toString(), 'sent');

      this.logger.info({ userId, type, channel: 'sms' }, 'SMS notification sent');
    } catch (error: unknown) {
      await this.logModel.updateStatus(log._id!.toString(), 'failed', getErrorMessage(error));
      this.logger.error({ userId, type, channel: 'sms', error }, 'SMS notification failed');
    }
  }

  private async sendPushNotification(
    userId: string,
    type: NotificationType,
    subscription: SendNotificationOptions['pushSubscription'],
    payload: SendNotificationOptions['payload'],
  ): Promise<void> {
    if (!subscription) return;

    const log = await this.logModel.create({
      userId,
      type,
      channel: 'push',
      subject: TYPE_TO_SETTING_NAME[type],
      status: 'pending',
      createdAt: new Date(),
    });

    try {
      const { title, body } = renderPush(payload);

      await sendPush({
        subscription,
        title,
        body,
        url: '/',
      });

      await this.logModel.updateStatus(log._id!.toString(), 'sent');

      this.logger.info({ userId, type, channel: 'push' }, 'Push notification sent');
    } catch (error: unknown) {
      await this.logModel.updateStatus(log._id!.toString(), 'failed', getErrorMessage(error));
      this.logger.error({ userId, type, channel: 'push', error }, 'Push notification failed');
    }
  }
}
