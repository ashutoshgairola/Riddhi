import { NextFunction, Request, Response } from 'express';
import { Db } from 'mongodb';

import { getErrorMessage } from '../common/utils';
import { createChildLogger } from '../config/logger';
import { NotificationLogModel } from './db';
import { PushSubscriptionModel } from './push-subscription-db';
import { NotificationLog, NotificationLogDTO, PushSubscriptionData } from './types/interface';

export class NotificationsController {
  private pushModel: PushSubscriptionModel;
  private logModel: NotificationLogModel;
  private logger = createChildLogger({ controller: 'NotificationsController' });

  constructor(db: Db) {
    this.pushModel = new PushSubscriptionModel(db);
    this.logModel = new NotificationLogModel(db);
    this.pushModel.initialize().catch((err) => {
      this.logger.error({ err }, 'Failed to initialize push subscriptions index');
    });
  }

  /** GET /api/notifications/vapid-public-key — no auth required */
  getVapidPublicKey = (_req: Request, res: Response): void => {
    const key = process.env.VAPID_PUBLIC_KEY;
    if (!key) {
      res.status(503).json({ error: 'Push notifications are not configured on this server' });
      return;
    }
    res.json({ vapidPublicKey: key });
  };

  /** POST /api/notifications/push/subscribe */
  subscribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.body.user as { userId: string };
      delete req.body.user;

      const { endpoint, keys } = req.body as PushSubscriptionData;
      const userAgent = req.headers['user-agent'];

      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        res.status(400).json({ error: 'endpoint and keys (p256dh, auth) are required' });
        return;
      }

      await this.pushModel.upsert(userId, { endpoint, keys }, userAgent);

      this.logger.info({ userId }, 'Push subscription saved');
      res.status(201).json({ message: 'Subscribed successfully' });
    } catch (error: unknown) {
      this.logger.error({ error: getErrorMessage(error) }, 'Error saving push subscription');
      next(error);
    }
  };

  /** DELETE /api/notifications/push/subscribe */
  unsubscribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.body.user as { userId: string };
      delete req.body.user;

      const { endpoint } = req.body as { endpoint: string };

      if (!endpoint) {
        res.status(400).json({ error: 'endpoint is required' });
        return;
      }

      const deleted = await this.pushModel.deleteByEndpoint(userId, endpoint);
      if (!deleted) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
      }

      this.logger.info({ userId }, 'Push subscription removed');
      res.json({ message: 'Unsubscribed successfully' });
    } catch (error: unknown) {
      this.logger.error({ error: getErrorMessage(error) }, 'Error removing push subscription');
      next(error);
    }
  };

  /** GET /api/notifications/push/status */
  getSubscriptionStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = req.body.user as { userId: string };
      delete req.body.user;

      const subs = await this.pushModel.findByUserId(userId);
      res.json({ subscribed: subs.length > 0, count: subs.length });
    } catch (error: unknown) {
      this.logger.error({ error: getErrorMessage(error) }, 'Error fetching subscription status');
      next(error);
    }
  };

  // ── Notification log endpoints ────────────────────────────────────────────

  private mapLog(log: NotificationLog): NotificationLogDTO {
    return {
      id: log._id?.toString() ?? '',
      type: log.type,
      channel: log.channel,
      subject: log.subject,
      status: log.status,
      isRead: log.isRead ?? false,
      createdAt: log.createdAt.toISOString(),
    };
  }

  /** GET /api/notifications/logs */
  getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.body.user as { userId: string };
      delete req.body.user;

      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const logs = await this.logModel.findByUserId(userId, limit);
      res.json({ data: logs.map((l) => this.mapLog(l)) });
    } catch (error: unknown) {
      this.logger.error({ error: getErrorMessage(error) }, 'Error fetching notification logs');
      next(error);
    }
  };

  /** PATCH /api/notifications/logs/:id/read */
  markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.body.user as { userId: string };
      delete req.body.user;

      const { id } = req.params;
      const updated = await this.logModel.markRead(id, userId);
      if (!updated) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }
      res.json({ message: 'Marked as read' });
    } catch (error: unknown) {
      this.logger.error({ error: getErrorMessage(error) }, 'Error marking notification as read');
      next(error);
    }
  };

  /** PATCH /api/notifications/logs/read-all */
  markAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.body.user as { userId: string };
      delete req.body.user;

      await this.logModel.markAllRead(userId);
      res.json({ message: 'All notifications marked as read' });
    } catch (error: unknown) {
      this.logger.error({ error: getErrorMessage(error) }, 'Error marking all notifications read');
      next(error);
    }
  };
}
