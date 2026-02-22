import { Collection, Db } from 'mongodb';

import { JobExecution, JobName } from './types/interface';

export class JobExecutionModel {
  private collection: Collection<JobExecution>;

  constructor(db: Db) {
    this.collection = db.collection<JobExecution>('jobExecutions');
  }

  async initialize(): Promise<void> {
    await this.collection.createIndex({ jobName: 1, startedAt: -1 });
    await this.collection.createIndex({ jobName: 1, status: 1 });
    // TTL: auto-delete execution logs older than 90 days
    await this.collection.createIndex({ startedAt: 1 }, { expireAfterSeconds: 90 * 86400 });
  }

  /**
   * Attempt to acquire a lock for a job. Returns the execution record if acquired,
   * null if the job is already running (prevents overlapping runs).
   */
  async acquireLock(jobName: JobName): Promise<JobExecution | null> {
    // Check if job is already running
    const running = await this.collection.findOne({
      jobName,
      status: 'running',
    });

    if (running) {
      // Check for stale locks (running for > 30 minutes = likely crashed)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (running.startedAt < thirtyMinutesAgo) {
        // Mark stale lock as failed
        await this.collection.updateOne(
          { _id: running._id },
          {
            $set: { status: 'failed', completedAt: new Date(), errors: ['Stale lock — timed out'] },
          },
        );
      } else {
        return null; // genuinely still running
      }
    }

    const execution: JobExecution = {
      jobName,
      startedAt: new Date(),
      status: 'running',
      processedCount: 0,
      errorCount: 0,
    };

    const result = await this.collection.insertOne(execution);
    return { ...execution, _id: result.insertedId };
  }

  async markCompleted(
    executionId: string,
    processedCount: number,
    errorCount: number,
    errors?: string[],
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const { ObjectId } = await import('mongodb');
    await this.collection.updateOne(
      { _id: new ObjectId(executionId) },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          processedCount,
          errorCount,
          ...(errors && { errors }),
          ...(metadata && { metadata }),
        },
      },
    );
  }

  async markFailed(executionId: string, error: string): Promise<void> {
    const { ObjectId } = await import('mongodb');
    await this.collection.updateOne(
      { _id: new ObjectId(executionId) },
      {
        $set: {
          status: 'failed',
          completedAt: new Date(),
          errors: [error],
        },
      },
    );
  }

  async getLastExecution(jobName: JobName): Promise<JobExecution | null> {
    return this.collection.findOne(
      { jobName, status: { $in: ['completed', 'failed'] } },
      { sort: { startedAt: -1 } },
    );
  }

  async getRecentExecutions(jobName: JobName, limit = 10): Promise<JobExecution[]> {
    return this.collection.find({ jobName }).sort({ startedAt: -1 }).limit(limit).toArray();
  }
}
