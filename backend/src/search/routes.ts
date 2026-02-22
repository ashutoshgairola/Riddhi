import { Router } from 'express';
import { Db } from 'mongodb';

import { AuthMiddleware } from '../middleware/auth';
import { SearchController } from './controller';
import { SearchService } from './service';

export class SearchRoutes {
  readonly router: Router;

  constructor(db: Db, authMiddleware: AuthMiddleware) {
    this.router = Router();
    const service = new SearchService(db);
    const controller = new SearchController(service);

    this.router.use(authMiddleware.authenticate);
    this.router.get('/', controller.search);
  }
}
