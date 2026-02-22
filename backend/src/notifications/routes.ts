import { Router } from 'express';
import { Db } from 'mongodb';

import { AuthMiddleware } from '../middleware/auth';
import { NotificationsController } from './controller';

export class NotificationsRoutes {
  readonly router: Router;
  private controller: NotificationsController;
  private authMiddleware: AuthMiddleware;

  constructor(db: Db, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.controller = new NotificationsController(db);
    this.authMiddleware = authMiddleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Public — frontend needs this before auth to init the SW
    this.router.get('/vapid-public-key', this.controller.getVapidPublicKey);

    // Protected routes
    this.router.use(this.authMiddleware.authenticate);
    this.router.post('/push/subscribe', this.controller.subscribe);
    this.router.delete('/push/subscribe', this.controller.unsubscribe);
    this.router.get('/push/status', this.controller.getSubscriptionStatus);

    // Notification log routes
    this.router.get('/logs', this.controller.getLogs);
    this.router.patch('/logs/read-all', this.controller.markAllRead);
    this.router.patch('/logs/:id/read', this.controller.markRead);
  }
}
