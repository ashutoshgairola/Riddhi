import dayjs from 'dayjs';
import { Collection, Db, Filter, ObjectId } from 'mongodb';

import { AssetClass, GetInvestmentsQuery, Investment, InvestmentType } from './types/interface';

export class InvestmentModel {
  public collection: Collection<Investment>;

  constructor(db: Db) {
    this.collection = db.collection<Investment>('investments');
  }

  async initialize(): Promise<void> {
    await this.collection.createIndex({ userId: 1, assetClass: 1 });
    await this.collection.createIndex({ userId: 1, accountId: 1 });
    await this.collection.createIndex({ userId: 1, type: 1 });
    await this.collection.createIndex({ userId: 1, purchaseDate: -1 });
  }

  async create(
    investment: Omit<Investment, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Investment> {
    const now = dayjs().toDate();
    const newInvestment: Investment = {
      ...investment,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(newInvestment);
    return { ...newInvestment, _id: result.insertedId };
  }

  async findById(id: string, userId: string): Promise<Investment | null> {
    return this.collection.findOne({
      _id: new ObjectId(id),
      userId,
    });
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<Omit<Investment, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Investment | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          ...updates,
          updatedAt: dayjs().toDate(),
        },
      },
      { returnDocument: 'after' },
    );

    return result as unknown as Investment | null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    return result.deletedCount === 1;
  }

  async findAll(
    userId: string,
    query: GetInvestmentsQuery,
  ): Promise<{ items: Investment[]; total: number; page: number; limit: number; pages: number }> {
    const filter: Filter<Investment> = { userId };

    if (query.assetClass) {
      const classes = query.assetClass.split(',');
      filter.assetClass = { $in: classes as AssetClass[] };
    }

    if (query.type) {
      const types = query.type.split(',');
      filter.type = { $in: types as InvestmentType[] };
    }

    if (query.accountId) {
      filter.accountId = query.accountId;
    }

    if (query.searchTerm) {
      filter.$or = [
        { name: { $regex: query.searchTerm, $options: 'i' } },
        { ticker: { $regex: query.searchTerm, $options: 'i' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const sort: Record<string, 1 | -1> = {};
    if (query.sort) {
      sort[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sort.purchaseDate = -1;
    }

    const total = await this.collection.countDocuments(filter);

    const items = await this.collection.find(filter).sort(sort).skip(skip).limit(limit).toArray();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findAllByUserId(userId: string): Promise<Investment[]> {
    return this.collection.find({ userId }).toArray();
  }
}
