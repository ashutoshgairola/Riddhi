import { Collection, Db } from 'mongodb';

import { UserPreferences } from './types/interface';

export class UserPreferencesModel {
  private collection: Collection<UserPreferences>;

  constructor(db: Db) {
    this.collection = db.collection<UserPreferences>('userPreferences');
  }

  async initialize(): Promise<void> {
    // Create indexes for faster queries
    await this.collection.createIndex({ userId: 1 }, { unique: true });
  }

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    return this.collection.findOne({ userId });
  }

  async createOrUpdate(
    userId: string,
    preferences: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    const now = new Date();

    // Try to find existing preferences
    const existingPreferences = await this.collection.findOne({ userId });

    if (existingPreferences) {
      // Update existing preferences
      const updatedPreferences = await this.collection.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...preferences,
            updatedAt: now,
          },
        },
        { returnDocument: 'after' },
      );

      return updatedPreferences.value!;
    } else {
      // Create new preferences with defaults
      const defaultPreferences: UserPreferences = {
        userId,
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        theme: 'system',
        startOfWeek: 'sunday',
        language: 'en',
        createdAt: now,
        updatedAt: now,
      };

      // Override defaults with any provided values
      const newPreferences: UserPreferences = {
        ...defaultPreferences,
        ...preferences,
      };

      const result = await this.collection.insertOne(newPreferences);
      return { ...newPreferences, _id: result.insertedId };
    }
  }
}
