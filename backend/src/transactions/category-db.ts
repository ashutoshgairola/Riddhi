import dayjs from 'dayjs';
import { Collection, Db, ObjectId } from 'mongodb';

import { TransactionCategory } from './types/interface';

export class CategoryModel {
  private collection: Collection<TransactionCategory>;

  constructor(db: Db) {
    this.collection = db.collection<TransactionCategory>('transactionCategories');
  }

  async initialize(): Promise<void> {
    // Create indexes for faster queries
    await this.collection.createIndex({ userId: 1, name: 1 }, { unique: true });
    await this.collection.createIndex({ userId: 1, parentId: 1 });
  }

  async create(
    category: Omit<TransactionCategory, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<TransactionCategory> {
    const now = dayjs().toDate();
    const newCategory: TransactionCategory = {
      ...category,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(newCategory);
    return { ...newCategory, _id: result.insertedId };
  }

  async findById(id: string, userId: string): Promise<TransactionCategory | null> {
    return this.collection.findOne({
      _id: new ObjectId(id),
      userId,
    });
  }

  async findByName(name: string, userId: string): Promise<TransactionCategory | null> {
    return this.collection.findOne({
      name,
      userId,
    });
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<Omit<TransactionCategory, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<TransactionCategory | null> {
    const updatedCategory = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          ...updates,
          updatedAt: dayjs().toDate(),
        },
      },
      { returnDocument: 'after' },
    );

    return updatedCategory.value;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    return result.deletedCount === 1;
  }

  async findAll(userId: string): Promise<TransactionCategory[]> {
    return this.collection.find({ userId }).sort({ name: 1 }).toArray();
  }

  async findByParentId(parentId: string, userId: string): Promise<TransactionCategory[]> {
    return this.collection.find({ parentId, userId }).sort({ name: 1 }).toArray();
  }

  async findByIds(categoryIds: string[], userId: string): Promise<TransactionCategory[]> {
    const objectIds = categoryIds.map((id) => new ObjectId(id));
    return this.collection
      .find({ _id: { $in: objectIds }, userId })
      .sort({ name: 1 })
      .toArray();
  }
}
