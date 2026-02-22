import { Db } from 'mongodb';
import cron, { ScheduledTask } from 'node-cron';

import { getErrorMessage } from '../common/utils';
import { createChildLogger } from '../config/logger';
import { NotificationService } from '../notifications/service';
import {
  createBudgetAlertsJob,
  createGoalContributionsJob,
  createMonthlyReportsJob,
  createOverdueGoalsCheckJob,
  createRecurringTransactionsJob,
} from './crons';
import { JobExecutionModel } from './db';
import { JobDefinition, JobExecution, JobName, JobResult } from './types/interface';

const logger = createChildLogger({ service: 'SchedulerService' });

export class SchedulerService {
  private executionModel: JobExecutionModel;
  private db: Db;
  private notificationService: NotificationService;

  private jobs: Map<JobName, JobDefinition> = new Map();
  private tasks: Map<JobName, ScheduledTask> = new Map();
  private running = false;

  constructor(db: Db, notificationService: NotificationService) {
    this.db = db;
    this.executionModel = new JobExecutionModel(db);
    this.notificationService = notificationService;
  }

  async initialize(): Promise<void> {
    await this.executionModel.initialize();
    this.registerJobs();
    logger.info({ jobCount: this.jobs.size }, 'Scheduler initialized');
  }

  // ── Job registration ────────────────────────────────────────────────────

  private registerJobs(): void {
    // ┌──────────── minute (0-59)
    // │ ┌────────── hour (0-23)
    // │ │ ┌──────── day of month (1-31)
    // │ │ │ ┌────── month (1-12)
    // │ │ │ │ ┌──── day of week (0-7, 0 or 7 = Sunday)
    // │ │ │ │ │

    this.registerJob({
      name: 'recurring_transactions',
      schedule: '0 1 * * *', // daily at 1:00 AM
      handler: createRecurringTransactionsJob(this.db),
      enabled: true,
      description: 'Creates new transaction instances from recurring templates',
    });

    this.registerJob({
      name: 'goal_contributions',
      schedule: '0 2 * * *', // daily at 2:00 AM
      handler: createGoalContributionsJob(this.db, this.notificationService),
      enabled: true,
      description: 'Auto-increments goal currentAmount based on contribution frequency',
    });

    this.registerJob({
      name: 'monthly_reports',
      schedule: '0 6 1 * *', // 1st of month at 6:00 AM
      handler: createMonthlyReportsJob(this.db, this.notificationService),
      enabled: true,
      description: 'Generates and sends monthly financial summaries to all users',
    });

    this.registerJob({
      name: 'budget_alerts',
      schedule: '0 8 * * *', // daily at 8:00 AM
      handler: createBudgetAlertsJob(this.db, this.notificationService),
      enabled: true,
      description: 'Scans active budgets for category overspend (80% / 100% thresholds)',
    });

    this.registerJob({
      name: 'overdue_goals_check',
      schedule: '0 9 * * *', // daily at 9:00 AM
      handler: createOverdueGoalsCheckJob(this.db, this.notificationService),
      enabled: true,
      description: 'Notifies users about active goals past their target date',
    });
  }

  private registerJob(definition: JobDefinition): void {
    if (!cron.validate(definition.schedule)) {
      logger.error(
        { job: definition.name, schedule: definition.schedule },
        'Invalid cron expression',
      );
      return;
    }
    this.jobs.set(definition.name, definition);
  }

  // ── Start / Stop ────────────────────────────────────────────────────────

  start(): void {
    if (this.running) {
      logger.warn('Scheduler is already running');
      return;
    }

    for (const [name, definition] of this.jobs) {
      if (!definition.enabled) {
        logger.info({ job: name }, 'Job is disabled, skipping');
        continue;
      }

      const task = cron.schedule(definition.schedule, () => {
        this.executeJob(name).catch((err) => {
          logger.error({ job: name, error: err }, 'Unhandled job execution error');
        });
      });

      this.tasks.set(name, task);

      logger.info(
        { job: name, schedule: definition.schedule, description: definition.description },
        'Job scheduled',
      );
    }

    this.running = true;
    logger.info({ jobCount: this.tasks.size }, 'Scheduler started');
  }

  stop(): void {
    for (const [name, task] of this.tasks) {
      task.stop();
      logger.info({ job: name }, 'Job stopped');
    }
    this.tasks.clear();
    this.running = false;
    logger.info('Scheduler stopped');
  }

  // ── Job execution (with locking + logging) ──────────────────────────────

  async executeJob(name: JobName): Promise<JobResult> {
    const definition = this.jobs.get(name);
    if (!definition) {
      throw new Error(`Unknown job: ${name}`);
    }

    // Acquire lock — prevents overlapping runs
    const execution = await this.executionModel.acquireLock(name);
    if (!execution) {
      logger.warn({ job: name }, 'Job is already running, skipping');
      return { processedCount: 0, errorCount: 0, metadata: { skipped: true } };
    }

    const executionId = execution._id?.toString() ?? '';
    logger.info({ job: name, executionId }, 'Job execution started');

    try {
      const result = await definition.handler();

      await this.executionModel.markCompleted(
        executionId,
        result.processedCount,
        result.errorCount,
        result.errors,
        result.metadata,
      );

      logger.info(
        {
          job: name,
          executionId,
          processed: result.processedCount,
          errors: result.errorCount,
        },
        'Job execution completed',
      );

      return result;
    } catch (error: unknown) {
      await this.executionModel.markFailed(executionId, getErrorMessage(error));
      logger.error({ job: name, executionId, error }, 'Job execution failed');

      return { processedCount: 0, errorCount: 1, errors: [getErrorMessage(error)] };
    }
  }

  // ── Manual trigger (for admin API) ──────────────────────────────────────

  async triggerJob(name: JobName): Promise<JobResult> {
    logger.info({ job: name }, 'Manual job trigger');
    return this.executeJob(name);
  }

  // ── Status API ──────────────────────────────────────────────────────────

  getJobDefinitions(): Array<{
    name: JobName;
    schedule: string;
    enabled: boolean;
    description: string;
  }> {
    return Array.from(this.jobs.values()).map(({ name, schedule, enabled, description }) => ({
      name,
      schedule,
      enabled,
      description,
    }));
  }

  async getJobHistory(name: JobName, limit = 10): Promise<JobExecution[]> {
    return this.executionModel.getRecentExecutions(name, limit);
  }

  async getLastRun(name: JobName): Promise<JobExecution | null> {
    return this.executionModel.getLastExecution(name);
  }

  async getAllJobStatuses(): Promise<
    Array<{
      name: JobName;
      schedule: string;
      enabled: boolean;
      description: string;
      lastRun: JobExecution | null;
    }>
  > {
    const statuses = [];
    for (const definition of this.jobs.values()) {
      const lastRun = await this.executionModel.getLastExecution(definition.name);
      statuses.push({
        name: definition.name,
        schedule: definition.schedule,
        enabled: definition.enabled,
        description: definition.description,
        lastRun,
      });
    }
    return statuses;
  }

  // ── Enable / Disable at runtime ─────────────────────────────────────────

  enableJob(name: JobName): void {
    const definition = this.jobs.get(name);
    if (!definition) throw new Error(`Unknown job: ${name}`);

    definition.enabled = true;

    // If scheduler is running and job wasn't scheduled, schedule it now
    if (this.running && !this.tasks.has(name)) {
      const task = cron.schedule(definition.schedule, () => {
        this.executeJob(name).catch((err) => {
          logger.error({ job: name, error: err }, 'Unhandled job execution error');
        });
      });
      this.tasks.set(name, task);
    }

    logger.info({ job: name }, 'Job enabled');
  }

  disableJob(name: JobName): void {
    const definition = this.jobs.get(name);
    if (!definition) throw new Error(`Unknown job: ${name}`);

    definition.enabled = false;

    const task = this.tasks.get(name);
    if (task) {
      task.stop();
      this.tasks.delete(name);
    }

    logger.info({ job: name }, 'Job disabled');
  }

  isRunning(): boolean {
    return this.running;
  }
}
