import { Collection, Db, ObjectId, Filter } from "mongodb";
import {
  Transaction,
  GetTransactionsQuery,
  PaginationResponse,
  TransactionType,
  TransactionStatus,
} from "./types/interface";
import dayjs from "dayjs";

export class TransactionModel {
  public collection: Collection<Transaction>;

  constructor(db: Db) {
    this.collection = db.collection<Transaction>("transactions");
  }

  async initialize(): Promise<void> {
    // Create indexes for faster queries
    await this.collection.createIndex({ userId: 1, date: -1 });
    await this.collection.createIndex({ userId: 1, accountId: 1 });
    await this.collection.createIndex({ userId: 1, categoryId: 1 });
    await this.collection.createIndex({ userId: 1, isRecurring: 1 });
    await this.collection.createIndex({ userId: 1, tags: 1 });
  }

  async create(
    transaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">
  ): Promise<Transaction> {
    const now = dayjs().toDate();
    const newTransaction: Transaction = {
      ...transaction,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(newTransaction);
    return { ...newTransaction, _id: result.insertedId };
  }

  async findById(id: string, userId: string): Promise<Transaction | null> {
    return this.collection.findOne({
      _id: new ObjectId(id),
      userId,
    });
  }

  async findByRecurringId(
    recurringId: string,
    userId: string
  ): Promise<Transaction[]> {
    return this.collection
      .find({
        recurringId,
        userId,
      })
      .toArray();
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<
      Omit<Transaction, "_id" | "userId" | "createdAt" | "updatedAt">
    >
  ): Promise<Transaction | null> {
    const updatedTransaction = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          ...updates,
          updatedAt: dayjs().toDate(),
        },
      },
      { returnDocument: "after" }
    );

    return updatedTransaction.value;
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
    query: GetTransactionsQuery
  ): Promise<{ transactions: Transaction[]; pagination: PaginationResponse }> {
    const filter: Filter<Transaction> = { userId };

    // Apply date filters
    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) {
        filter.date.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.date.$lte = new Date(query.endDate);
      }
    }

    // Apply type filters
    if (query.types) {
      const types = query.types.split(",");
      filter.type = { $in: types as TransactionType[] };
    }

    // Apply category filters
    if (query.categoryIds) {
      const categoryIds = query.categoryIds.split(",");
      filter.categoryId = { $in: categoryIds };
    }

    // Apply account filters
    if (query.accountIds) {
      const accountIds = query.accountIds.split(",");
      filter.accountId = { $in: accountIds };
    }

    // Apply amount filters
    if (query.minAmount !== undefined || query.maxAmount !== undefined) {
      filter.amount = {};
      if (query.minAmount !== undefined) {
        filter.amount.$gte = query.minAmount;
      }
      if (query.maxAmount !== undefined) {
        filter.amount.$lte = query.maxAmount;
      }
    }

    // Apply text search
    if (query.searchTerm) {
      filter.$or = [
        { description: { $regex: query.searchTerm, $options: "i" } },
        { notes: { $regex: query.searchTerm, $options: "i" } },
      ];
    }

    // Apply tag filters
    if (query.tags) {
      const tags = query.tags.split(",");
      filter.tags = { $elemMatch: { $in: tags } };
    }

    // Apply status filters
    if (query.status) {
      const statuses = query.status.split(",");
      filter.status = { $in: statuses as TransactionStatus[] };
    }

    // Set up pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Set up sorting
    const sort: any = {};
    if (query.sort) {
      sort[query.sort] = query.order === "asc" ? 1 : -1;
    } else {
      sort.date = -1; // Default sort by date descending
    }

    // Get total count
    const total = await this.collection.countDocuments(filter);

    // Get paginated transactions
    const transactions = await this.collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Calculate pagination metadata
    const pagination: PaginationResponse = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };

    return { transactions, pagination };
  }

  async countByCategory(userId: string, categoryId: string): Promise<number> {
    return this.collection.countDocuments({
      userId,
      categoryId,
    });
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    return this.collection
      .find({
        userId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .toArray();
  }

  async findByDateRangeAndCategory(
    userId: string,
    startDate: Date,
    endDate: Date,
    categoryId: string
  ): Promise<Transaction[]> {
    return this.collection
      .find({
        userId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
        categoryId,
      })
      .toArray();
  }

  async countByAccountId(userId: string, accountId: string): Promise<number> {
    return this.collection.countDocuments({
      userId,
      accountId,
    });
  }

  async findRecentByAccountId(
    userId: string,
    accountId: string,
    limit: number
  ): Promise<Transaction[]> {
    return this.collection
      .find({
        userId,
        accountId,
      })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
  }
}
