import { Collection, Db, ObjectId } from 'mongodb';

import { NotificationSetting } from './types/interface';

export class NotificationSettingModel {
  private collection: Collection<NotificationSetting>;

  constructor(db: Db) {
    this.collection = db.collection<NotificationSetting>('notificationSettings');
  }

  async initialize(): Promise<void> {
    // Create indexes for faster queries
    await this.collection.createIndex({ userId: 1, name: 1 }, { unique: true });
  }

  async findByUserId(userId: string): Promise<NotificationSetting[]> {
    return this.collection.find({ userId }).toArray();
  }

  async findById(id: string, userId: string): Promise<NotificationSetting | null> {
    return this.collection.findOne({
      _id: new ObjectId(id),
      userId,
    });
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<NotificationSetting>,
  ): Promise<NotificationSetting | null> {
    const now = new Date();

    const updatedSetting = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          ...updates,
          updatedAt: now,
        },
      },
      { returnDocument: 'after' },
    );

    return updatedSetting as unknown as NotificationSetting | null;
  }

  async createDefaultSettings(userId: string): Promise<NotificationSetting[]> {
    const now = new Date();

    // Define default notification settings
    const defaultSettings: Omit<NotificationSetting, '_id'>[] = [
      {
        userId,
        name: 'Budget Alerts',
        description: 'Notifications when you approach or exceed budget limits',
        email: true,
        push: true,
        sms: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId,
        name: 'Goal Progress',
        description: 'Updates on your progress towards financial goals',
        email: true,
        push: true,
        sms: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId,
        name: 'Large Transactions',
        description: 'Alerts for unusually large transactions',
        email: true,
        push: true,
        sms: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId,
        name: 'Monthly Reports',
        description: 'Monthly summary of your financial activity',
        email: true,
        push: false,
        sms: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId,
        name: 'Security Alerts',
        description: 'Notifications about security-related events',
        email: true,
        push: true,
        sms: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Check if user already has settings
    const existingSettings = await this.findByUserId(userId);

    if (existingSettings.length > 0) {
      // User already has settings, return them
      return existingSettings;
    }

    // Insert default settings
    const result = await this.collection.insertMany(defaultSettings);

    // Return the created settings with IDs
    return defaultSettings.map((setting, index) => ({
      ...setting,
      _id: result.insertedIds[index],
    }));
  }
}
