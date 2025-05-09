import { Router } from 'express';

import { AuthMiddleware } from '../middleware/auth';
import { UploadMiddleware } from '../middleware/upload';
import { TransactionController } from './controller';

export class TransactionRoutes {
  private router: Router;
  private controller: TransactionController;
  private authMiddleware: AuthMiddleware;
  private uploadMiddleware: UploadMiddleware;

  constructor(controller: TransactionController, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.controller = controller;
    this.authMiddleware = authMiddleware;
    this.uploadMiddleware = new UploadMiddleware();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // All routes require authentication
    this.router.use(this.authMiddleware.authenticate);

    // Category routes
    this.router.get('/categories', this.controller.getCategories);
    this.router.post('/categories', this.controller.createCategory);
    this.router.put('/categories/:id', this.controller.updateCategory);
    this.router.delete('/categories/:id', this.controller.deleteCategory);

    // Transaction routes
    this.router.get('/', this.controller.getTransactions);
    this.router.get('/:id', this.controller.getTransactionById);
    this.router.post('/', this.controller.createTransaction);
    this.router.put('/:id', this.controller.updateTransaction);
    this.router.delete('/:id', this.controller.deleteTransaction);

    // Attachment routes
    this.router.post(
      '/:id/attachments',
      this.uploadMiddleware.handleUpload,
      this.controller.uploadAttachment,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
