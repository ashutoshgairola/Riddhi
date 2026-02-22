import { NextFunction, Request, Response } from 'express';

import { getErrorMessage } from '../common/utils';
import { createChildLogger } from '../config/logger';
import { SearchService } from './service';

export class SearchController {
  private searchService: SearchService;
  private logger = createChildLogger({ controller: 'SearchController' });

  constructor(searchService: SearchService) {
    this.searchService = searchService;
  }

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.body.user as { userId: string };
      delete req.body.user;

      const q = (req.query.q as string | undefined)?.trim() ?? '';

      if (!q) {
        res.json({ query: '', total: 0, results: [] });
        return;
      }

      if (q.length < 2) {
        res.status(400).json({ error: 'Search query must be at least 2 characters' });
        return;
      }

      const results = await this.searchService.search(userId, q);

      this.logger.info({ userId, query: q, total: results.total }, 'Search completed');

      res.json(results);
    } catch (error: unknown) {
      this.logger.error({ error: getErrorMessage(error) }, 'Search failed');
      next(error);
    }
  };
}
