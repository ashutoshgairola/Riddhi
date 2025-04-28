import { Collection, Db, ObjectId } from 'mongodb';

import { AccountConnection } from './types/interface';

export class AccountConnectionModel {
  public collection: Collection<AccountConnection>;

  constructor(db: Db) {
    this.collection = db.collection<AccountConnection>('accountConnections');
  }

  async initialize(): Promise<void> {
    // Create indexes for faster queries
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ userId: 1, institutionId: 1 });
  }

  async findByUserId(userId: string): Promise<AccountConnection[]> {
    return this.collection.find({ userId }).toArray();
  }

  async findById(id: string, userId: string): Promise<AccountConnection | null> {
    return this.collection.findOne({
      _id: new ObjectId(id),
      userId,
    });
  }

  async create(
    connection: Omit<AccountConnection, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<AccountConnection> {
    const now = new Date();
    const newConnection: AccountConnection = {
      ...connection,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(newConnection);
    return { ...newConnection, _id: result.insertedId };
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<AccountConnection>,
  ): Promise<AccountConnection | null> {
    const now = new Date();

    const updatedConnection = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          ...updates,
          updatedAt: now,
        },
      },
      { returnDocument: 'after' },
    );

    return updatedConnection.value;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    return result.deletedCount === 1;
  }
}
