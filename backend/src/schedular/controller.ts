import { Request, Response } from 'express';

import { sendResponse } from '../common/utils';
import { createChildLogger } from '../config/logger';
import { SchedulerService } from './service';
import { JobName } from './types/interface';

const VALID_JOB_NAMES: JobName[] = [
  'recurring_transactions',
  'goal_contributions',
  'monthly_reports',
  'budget_alerts',
  'overdue_goals_check',
];

export class SchedulerController {
  private schedulerService: SchedulerService;
  private logger = createChildLogger({ controller: 'SchedulerController' });

  constructor(schedulerService: SchedulerService) {
    this.schedulerService = schedulerService;
  }

  /**
   * GET /api/admin/scheduler/status
   * Returns all registered jobs with their schedule, enabled state, and last run info.
   */
  getStatus = async (_req: Request, res: Response): Promise<void> => {
    try {
      const statuses = await this.schedulerService.getAllJobStatuses();
      sendResponse({
        res,
        status: 200,
        data: { running: this.schedulerService.isRunning(), jobs: statuses },
        message: 'Scheduler status retrieved',
      });
    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to get scheduler status');
      sendResponse({ res, status: 500, data: null, message: 'Failed to get scheduler status' });
    }
  };

  /**
   * GET /api/admin/scheduler/jobs/:name/history
   * Returns recent execution history for a specific job.
   */
  getJobHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.params;

      if (!this.isValidJobName(name)) {
        sendResponse({ res, status: 400, data: null, message: `Invalid job name: ${name}` });
        return;
      }

      const limit = parseInt(req.query.limit as string, 10) || 10;
      const history = await this.schedulerService.getJobHistory(name as JobName, limit);

      sendResponse({ res, status: 200, data: history, message: 'Job history retrieved' });
    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to get job history');
      sendResponse({ res, status: 500, data: null, message: 'Failed to get job history' });
    }
  };

  /**
   * POST /api/admin/scheduler/jobs/:name/trigger
   * Manually trigger a job execution.
   */
  triggerJob = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.params;

      if (!this.isValidJobName(name)) {
        sendResponse({ res, status: 400, data: null, message: `Invalid job name: ${name}` });
        return;
      }

      this.logger.info({ job: name }, 'Manual job trigger requested');

      const result = await this.schedulerService.triggerJob(name as JobName);

      sendResponse({ res, status: 200, data: result, message: `Job '${name}' executed` });
    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to trigger job');
      sendResponse({ res, status: 500, data: null, message: 'Failed to trigger job' });
    }
  };

  /**
   * POST /api/admin/scheduler/jobs/:name/enable
   */
  enableJob = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.params;

      if (!this.isValidJobName(name)) {
        sendResponse({ res, status: 400, data: null, message: `Invalid job name: ${name}` });
        return;
      }

      this.schedulerService.enableJob(name as JobName);

      sendResponse({ res, status: 200, data: null, message: `Job '${name}' enabled` });
    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to enable job');
      sendResponse({ res, status: 500, data: null, message: 'Failed to enable job' });
    }
  };

  /**
   * POST /api/admin/scheduler/jobs/:name/disable
   */
  disableJob = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.params;

      if (!this.isValidJobName(name)) {
        sendResponse({ res, status: 400, data: null, message: `Invalid job name: ${name}` });
        return;
      }

      this.schedulerService.disableJob(name as JobName);

      sendResponse({ res, status: 200, data: null, message: `Job '${name}' disabled` });
    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to disable job');
      sendResponse({ res, status: 500, data: null, message: 'Failed to disable job' });
    }
  };

  private isValidJobName(name: string): boolean {
    return VALID_JOB_NAMES.includes(name as JobName);
  }
}
