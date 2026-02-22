// backend/src/dashboard/controller.ts
import { NextFunction, Request, Response } from 'express';

import { sendResponse } from '../common/utils';
import { createChildLogger } from '../config/logger';
import { DashboardService } from './service';

export class DashboardController {
  private dashboardService: DashboardService;
  private logger = createChildLogger({ controller: 'DashboardController' });

  constructor(dashboardService: DashboardService) {
    this.dashboardService = dashboardService;
  }

  getDashboardData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'getDashboardData' });
    try {
      const { userId } = req.body.user;
      delete req.body.user;

      requestLogger.info({ userId }, 'Fetching dashboard data');
      const data = await this.dashboardService.getDashboardData(userId);
      sendResponse({ res, data, message: 'Dashboard data fetched successfully' });
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error fetching dashboard data');
      next(error);
    }
  };
}
