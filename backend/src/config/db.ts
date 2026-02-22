import { Db, MongoClient } from 'mongodb';

import { log } from './logger';

export class DatabaseConfig {
  private static instance: DatabaseConfig;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  async connect(): Promise<void> {
    try {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
      const dbName = process.env.DB_NAME || 'finance-tracker';

      log.info('Connecting to MongoDB', {
        mongoUri: mongoUri.replace(/\/\/.*@/, '//***@'),
        dbName,
      });

      this.client = new MongoClient(mongoUri);
      await this.client.connect();
      this.db = this.client.db(dbName);

      log.info('Successfully connected to MongoDB', { dbName });
    } catch (error) {
      log.error('Failed to connect to MongoDB', { error, dbName: process.env.DB_NAME });
      throw error;
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      log.info('Disconnecting from MongoDB');
      await this.client.close();
      this.client = null;
      this.db = null;
      log.info('Successfully disconnected from MongoDB');
    }
  }
}
