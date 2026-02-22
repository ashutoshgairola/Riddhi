import { Collection, Db, ObjectId } from 'mongodb';

import { NotificationLog, NotificationStatus, NotificationType } from './types/interface';

export class NotificationLogModel {
  private collection: Collection<NotificationLog>;

  constructor(db: Db) {
    this.collection = db.collection<NotificationLog>('notificationLogs');
  }

  async initialize(): Promise<void> {
    await this.collection.createIndex({ userId: 1, createdAt: -1 });
    await this.collection.createIndex({ userId: 1, type: 1 });
    await this.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 90 * 86400 }); // TTL: 90 days
  }

  async create(log: Omit<NotificationLog, '_id'>): Promise<NotificationLog> {
    const result = await this.collection.insertOne(log);
    return { ...log, _id: result.insertedId };
  }

  async findByUserId(userId: string, limit = 50): Promise<NotificationLog[]> {
    return this.collection.find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray();
  }

  async findByType(userId: string, type: NotificationType, limit = 20): Promise<NotificationLog[]> {
    return this.collection.find({ userId, type }).sort({ createdAt: -1 }).limit(limit).toArray();
  }

  async findRecentByDedupeKey(
    userId: string,
    type: NotificationType,
    status: NotificationStatus,
    dedupeKey: string,
    since: Date,
  ): Promise<NotificationLog | null> {
    return this.collection.findOne({
      userId,
      type,
      status,
      'metadata.dedupeKey': dedupeKey,
      createdAt: { $gte: since },
    });
  }

  async updateStatus(id: string, status: NotificationStatus, error?: string): Promise<void> {
    const update: { $set: { status: NotificationStatus; error?: string } } = { $set: { status } };
    if (error) {
      update.$set.error = error;
    }

    await this.collection.updateOne({ _id: new ObjectId(id) }, update);
  }

  async markRead(id: string, userId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id), userId },
      { $set: { isRead: true } },
    );
    return result.modifiedCount > 0;
  }

  async markAllRead(userId: string): Promise<void> {
    await this.collection.updateMany({ userId, isRead: { $ne: true } }, { $set: { isRead: true } });
  }
}
