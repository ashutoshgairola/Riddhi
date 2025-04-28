import { Collection, Db, Filter, ObjectId } from 'mongodb';

import { GetGoalsQuery, Goal, GoalStatus, GoalType, PaginationResponse } from './types/interface';

export class GoalModel {
  public collection: Collection<Goal>;

  constructor(db: Db) {
    this.collection = db.collection<Goal>('goals');
  }

  async initialize(): Promise<void> {
    // Create indexes for faster queries
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ userId: 1, type: 1 });
    await this.collection.createIndex({ userId: 1, status: 1 });
    await this.collection.createIndex({ userId: 1, targetDate: 1 });
    await this.collection.createIndex({ userId: 1, priority: 1 });
  }

  async create(goal: Omit<Goal, '_id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    const now = new Date();
    const newGoal: Goal = {
      ...goal,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(newGoal);
    return { ...newGoal, _id: result.insertedId };
  }

  async findById(id: string, userId: string): Promise<Goal | null> {
    return this.collection.findOne({
      _id: new ObjectId(id),
      userId,
    });
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<Omit<Goal, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Goal | null> {
    const updatedGoal = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    );

    return updatedGoal.value;
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
    query: GetGoalsQuery,
  ): Promise<{ goals: Goal[]; pagination: PaginationResponse }> {
    const filter: Filter<Goal> = { userId };

    // Apply type filter if provided
    if (query.type) {
      const types = query.type.split(',');
      filter.type = { $in: types as GoalType[] };
    }

    // Apply status filter if provided
    if (query.status) {
      const statuses = query.status.split(',');
      filter.status = { $in: statuses as GoalStatus[] };
    }

    // Set up pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.collection.countDocuments(filter);

    // Get paginated goals
    const goals = await this.collection
      .find(filter)
      .sort({ priority: 1, targetDate: 1 }) // Sort by priority (highest first) then target date
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

    return { goals, pagination };
  }

  async updateStatus(id: string, userId: string, status: GoalStatus): Promise<Goal | null> {
    // For completing a goal, set currentAmount to targetAmount
    const updates: any = { status };

    if (status === 'completed') {
      const goal = await this.findById(id, userId);
      if (goal) {
        updates.currentAmount = goal.targetAmount;
      }
    }

    return this.update(id, userId, updates);
  }
}
