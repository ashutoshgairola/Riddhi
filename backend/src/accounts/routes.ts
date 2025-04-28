import { Router } from 'express';

import { AuthMiddleware } from '../middleware/auth';
import { AccountController } from './controller';

export class AccountRoutes {
  private router: Router;
  private controller: AccountController;
  private authMiddleware: AuthMiddleware;

  constructor(controller: AccountController, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.controller = controller;
    this.authMiddleware = authMiddleware;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // All routes require authentication
    this.router.use(this.authMiddleware.authenticate);

    // Account routes
    this.router.get('/', this.controller.getAccounts);
    this.router.get('/:id', this.controller.getAccountById);
    this.router.post('/', this.controller.createAccount);
    this.router.put('/:id', this.controller.updateAccount);
    this.router.delete('/:id', this.controller.deleteAccount);
  }

  getRouter(): Router {
    return this.router;
  }
}
