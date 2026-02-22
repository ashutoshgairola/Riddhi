import { Collection, Db, ObjectId } from 'mongodb';

import { PushSubscriptionData } from './types/interface';

export interface StoredPushSubscription {
  _id?: ObjectId;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PushSubscriptionModel {
  private collection: Collection<StoredPushSubscription>;

  constructor(db: Db) {
    this.collection = db.collection<StoredPushSubscription>('pushSubscriptions');
  }

  async initialize(): Promise<void> {
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ endpoint: 1 }, { unique: true });
  }

  async upsert(
    userId: string,
    subscription: PushSubscriptionData,
    userAgent?: string,
  ): Promise<StoredPushSubscription> {
    const now = new Date();

    const result = await this.collection.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        $set: {
          userId,
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          userAgent,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true, returnDocument: 'after' },
    );

    return result as unknown as StoredPushSubscription;
  }

  async deleteByEndpoint(userId: string, endpoint: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ userId, endpoint });
    return result.deletedCount > 0;
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.collection.deleteMany({ userId });
  }

  async findByUserId(userId: string): Promise<StoredPushSubscription[]> {
    return this.collection.find({ userId }).toArray();
  }
}
