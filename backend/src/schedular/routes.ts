import { Router } from 'express';

import { SchedulerController } from './controller';

export class SchedulerRoutes {
  public router: Router;
  private controller: SchedulerController;

  constructor(controller: SchedulerController) {
    this.controller = controller;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Scheduler overview
    this.router.get('/status', this.controller.getStatus);

    // Per-job operations
    this.router.get('/jobs/:name/history', this.controller.getJobHistory);
    this.router.post('/jobs/:name/trigger', this.controller.triggerJob);
    this.router.post('/jobs/:name/enable', this.controller.enableJob);
    this.router.post('/jobs/:name/disable', this.controller.disableJob);
  }
}
