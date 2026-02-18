import { Collection, Db, Filter, ObjectId } from 'mongodb';

import { Account, AccountType } from './types/interface';

export class AccountModel {
  public collection: Collection<Account>;

  constructor(db: Db) {
    this.collection = db.collection<Account>('accounts');
  }

  async initialize(): Promise<void> {
    // Create indexes for faster queries
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ userId: 1, type: 1 });
    await this.collection.createIndex({ userId: 1, includeInNetWorth: 1 });
  }

  async create(account: Omit<Account, '_id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const now = new Date();
    const newAccount: Account = {
      ...account,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(newAccount);
    return { ...newAccount, _id: result.insertedId };
  }

  async findById(id: string, userId: string): Promise<Account | null> {
    return this.collection.findOne({
      _id: new ObjectId(id),
      userId,
    });
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<Omit<Account, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Account | null> {
    // Always update the lastUpdated timestamp
    updates.lastUpdated = new Date();
    (updates as Partial<Account>).updatedAt = new Date();

    const updatedAccount = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      {
        $set: updates,
      },
      { returnDocument: 'after' },
    );

    return updatedAccount.value;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    return result.deletedCount === 1;
  }

  async findAll(userId: string, type?: string[]): Promise<Account[]> {
    const filter: Filter<Account> = { userId };

    // Apply type filter if provided
    if (type && type.length > 0) {
      filter.type = { $in: type as AccountType[] };
    }

    return this.collection.find(filter).sort({ name: 1 }).toArray();
  }

  async getNetWorthAccounts(userId: string): Promise<Account[]> {
    return this.collection
      .find({
        userId,
        includeInNetWorth: true,
      })
      .toArray();
  }

  async countTransactions(_id: string, _userId: string): Promise<number> {
    // This would typically be implemented by querying the transactions collection
    // For now, we'll return a mock value, and the actual implementation would be
    // provided when we integrate with the transactions domain
    return 0;
  }
}
