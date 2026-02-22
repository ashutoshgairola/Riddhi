import { Collection, Db, Filter, ObjectId } from 'mongodb';

import { Budget, GetBudgetsQuery, PaginationResponse } from './types/interface';

export class BudgetModel {
  public collection: Collection<Budget>;

  constructor(db: Db) {
    this.collection = db.collection<Budget>('budgets');
  }

  async initialize(): Promise<void> {
    // Create indexes for faster queries
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ startDate: 1, endDate: 1 });
    await this.collection.createIndex({ userId: 1, startDate: 1, endDate: 1 });
    await this.collection.createIndex({ 'categories.categoryIds': 1 });
  }

  async create(budget: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    const now = new Date();
    const newBudget: Budget = {
      ...budget,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(newBudget);
    return { ...newBudget, _id: result.insertedId };
  }

  // FIX: Added userId parameter — previously any user could read any budget by ObjectId
  async findById(id: string, userId: string): Promise<Budget | null> {
    return this.collection.findOne({
      _id: new ObjectId(id),
      userId,
    });
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<Omit<Budget, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Budget | null> {
    const updatedBudget = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    );

    return updatedBudget as unknown as Budget | null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    return result.deletedCount === 1;
  }

  async findAll(userId: string, query: GetBudgetsQuery): Promise<PaginationResponse<Budget>> {
    const filter: Filter<Budget> = { userId };

    // Apply date filters if provided
    if (query.startDate || query.endDate) {
      if (query.startDate) {
        filter.endDate = { $gte: new Date(query.startDate) };
      }
      if (query.endDate) {
        filter.startDate = { $lte: new Date(query.endDate) };
      }
    }

    // Set up pagination
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.collection.countDocuments(filter);

    // Get paginated budgets
    const budgets = await this.collection
      .find(filter)
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Calculate pagination metadata
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };

    return { items: budgets, ...pagination };
  }

  async findCurrent(userId: string): Promise<Budget | null> {
    const now = new Date();

    return this.collection.findOne({
      userId,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
  }

  async checkOverlappingBudgets(
    userId: string,
    startDate: Date,
    endDate: Date,
    excludeBudgetId?: string,
  ): Promise<boolean> {
    const filter: Filter<Budget> = {
      userId,
      $or: [
        // New budget starts during an existing budget
        {
          startDate: { $lte: startDate },
          endDate: { $gte: startDate },
        },
        // New budget ends during an existing budget
        {
          startDate: { $lte: endDate },
          endDate: { $gte: endDate },
        },
        // New budget completely contains an existing budget
        {
          startDate: { $gte: startDate },
          endDate: { $lte: endDate },
        },
      ],
    };

    // Exclude the current budget if updating
    if (excludeBudgetId) {
      filter._id = { $ne: new ObjectId(excludeBudgetId) };
    }

    const count = await this.collection.countDocuments(filter);
    return count > 0;
  }

  async updateCategorySpent(
    budgetId: string,
    userId: string,
    budgetCategoryId: string,
    amount: number,
  ): Promise<boolean> {
    // Update the budget category's spent amount using its _id
    const result = await this.collection.updateOne(
      {
        _id: new ObjectId(budgetId),
        userId,
        'categories._id': new ObjectId(budgetCategoryId),
      },
      {
        $set: {
          'categories.$.spent': amount,
          updatedAt: new Date(),
        },
      },
    );

    return result.modifiedCount === 1;
  }

  async addCategory(
    budgetId: string,
    userId: string,
    category: Omit<Budget['categories'][0], '_id'>,
  ): Promise<Budget['categories'][0] | null> {
    // Add _id to the category
    const categoryWithId = {
      ...category,
      _id: new ObjectId(),
    };

    // Update the budget with the new category
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(budgetId), userId },
      {
        $push: { categories: categoryWithId },
        $inc: { totalAllocated: category.allocated },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' },
    );

    const addedBudget = result as unknown as Budget | null;
    if (!addedBudget) {
      return null;
    }

    // Find the added category
    const addedCategory = addedBudget.categories.find(
      (c) => c._id?.toString() === categoryWithId._id.toString(),
    );

    return addedCategory || null;
  }

  async updateCategory(
    budgetId: string,
    userId: string,
    categoryId: string,
    updates: Partial<Omit<Budget['categories'][0], '_id' | 'categoryIds' | 'spent'>>,
  ): Promise<Budget['categories'][0] | null> {
    // FIX: We still need to read the budget to find the category and compute
    // the allocation difference, but we now use atomic $inc for totalAllocated
    // instead of read-then-$set which was vulnerable to concurrent writes.
    const budget = await this.findById(budgetId, userId);
    if (!budget) {
      return null;
    }

    // Find the category
    const category = budget.categories.find((c) => c._id?.toString() === categoryId);
    if (!category) {
      return null;
    }

    // Calculate allocation difference if allocated amount is being updated
    let allocatedDifference = 0;
    if (updates.allocated !== undefined) {
      allocatedDifference = updates.allocated - category.allocated;
    }

    // Build positional $set for category fields
    const setObject: Record<string, unknown> = { updatedAt: new Date() };
    for (const [key, value] of Object.entries(updates)) {
      setObject[`categories.$.${key}`] = value;
    }

    // FIX: Use atomic $inc for totalAllocated instead of computing and $set-ing.
    // Previously, two rapid allocation edits could cause the second read to be stale,
    // overwriting the first's change and drifting totalAllocated from the true sum.
    const updateOp: { $set: Record<string, unknown>; $inc?: Record<string, number> } = {
      $set: setObject,
    };
    if (allocatedDifference !== 0) {
      updateOp.$inc = { totalAllocated: allocatedDifference };
    }

    const result = await this.collection.findOneAndUpdate(
      {
        _id: new ObjectId(budgetId),
        userId,
        'categories._id': new ObjectId(categoryId),
      },
      updateOp,
      { returnDocument: 'after' },
    );

    const updatedBudget = result as unknown as Budget | null;
    if (!updatedBudget) {
      return null;
    }

    // Find the updated category
    const updatedCategory = updatedBudget.categories.find((c) => c._id?.toString() === categoryId);
    return updatedCategory || null;
  }

  async deleteCategory(budgetId: string, userId: string, categoryId: string): Promise<boolean> {
    // First get the current budget to calculate new totalAllocated
    const budget = await this.findById(budgetId, userId);
    if (!budget) {
      return false;
    }

    // Find the category
    const category = budget.categories.find((c) => c._id?.toString() === categoryId);
    if (!category) {
      return false;
    }

    // Remove the category and update totalAllocated
    // FIX: Use $inc (atomic) and then clamp totalSpent to 0 minimum.
    // Previously, if totalSpent was already out of sync, $inc with a negative
    // value could push it below zero.
    const result = await this.collection.updateOne(
      { _id: new ObjectId(budgetId), userId },
      {
        $pull: { categories: { _id: new ObjectId(categoryId) } },
        $inc: {
          totalAllocated: -category.allocated,
          totalSpent: -category.spent,
        },
        $set: { updatedAt: new Date() },
      },
    );

    if (result.modifiedCount !== 1) {
      return false;
    }

    // Floor totalSpent at 0 if it went negative
    await this.collection.updateOne(
      {
        _id: new ObjectId(budgetId),
        userId,
        totalSpent: { $lt: 0 },
      },
      { $set: { totalSpent: 0 } },
    );

    return true;
  }

  // New methods for transaction integration

  /**
   * Find budgets that contain a specific date range
   */
  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Budget[]> {
    return this.collection
      .find({
        userId,
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      })
      .toArray();
  }

  /**
   * Helper to find the matching budget category for a given transaction category ID.
   * Handles backward compatibility with old single-categoryId format.
   */
  private findMatchingBudgetCategory(
    budget: Budget,
    transactionCategoryId: string,
  ): Budget['categories'][0] | null {
    return (
      budget.categories.find((c) => {
        if (c.categoryIds && Array.isArray(c.categoryIds)) {
          return c.categoryIds.includes(transactionCategoryId);
        }
        if ((c as any).categoryId) {
          return (c as any).categoryId === transactionCategoryId;
        }
        return false;
      }) || null
    );
  }

  /**
   * Adjust the spent amount for a specific category in a budget.
   *
   * FIX: Uses an aggregation pipeline update to atomically compute the new spent
   * value. Previously this was a read-then-$set which meant two concurrent
   * transactions could both read the same spent value and one update would be lost.
   */
  async adjustCategorySpent(
    budgetId: string,
    userId: string,
    transactionCategoryId: string,
    amount: number,
  ): Promise<boolean> {
    const budget = await this.findById(budgetId, userId);
    if (!budget) {
      return false;
    }

    const budgetCategory = this.findMatchingBudgetCategory(budget, transactionCategoryId);
    if (!budgetCategory) {
      return false;
    }

    // Use aggregation pipeline update for atomic increment with floor at 0
    const result = await this.collection.updateOne(
      {
        _id: new ObjectId(budgetId),
        userId,
        'categories._id': budgetCategory._id,
      },
      [
        {
          $set: {
            categories: {
              $map: {
                input: '$categories',
                as: 'cat',
                in: {
                  $cond: {
                    if: { $eq: ['$$cat._id', budgetCategory._id] },
                    then: {
                      $mergeObjects: [
                        '$$cat',
                        { spent: { $max: [0, { $add: ['$$cat.spent', amount] }] } },
                      ],
                    },
                    else: '$$cat',
                  },
                },
              },
            },
            updatedAt: new Date(),
          },
        },
        // Recompute totalSpent from the (now-updated) categories array
        {
          $set: {
            totalSpent: {
              $max: [
                0,
                {
                  $reduce: {
                    input: '$categories',
                    initialValue: 0,
                    in: { $add: ['$$value', '$$this.spent'] },
                  },
                },
              ],
            },
          },
        },
      ],
    );

    return result.modifiedCount === 1;
  }

  /**
   * Get a budget category that contains a specific transaction category ID
   */
  async getBudgetCategory(
    budgetId: string,
    userId: string,
    transactionCategoryId: string,
  ): Promise<Budget['categories'][0] | null> {
    const budget = await this.findById(budgetId, userId);
    if (!budget) {
      return null;
    }

    return this.findMatchingBudgetCategory(budget, transactionCategoryId);
  }

  /**
   * Check if a budget contains a specific transaction category
   */
  async hasBudgetCategory(
    budgetId: string,
    userId: string,
    transactionCategoryId: string,
  ): Promise<boolean> {
    const category = await this.getBudgetCategory(budgetId, userId, transactionCategoryId);
    return category !== null;
  }

  /**
   * Reset all spent amounts for a budget (useful for budget recalculation)
   */
  async resetSpentAmounts(budgetId: string, userId: string): Promise<boolean> {
    const budget = await this.findById(budgetId, userId);
    if (!budget) {
      return false;
    }

    // Reset all categories' spent to 0
    const resetCategories = budget.categories.map((category) => ({
      ...category,
      spent: 0,
    }));

    const result = await this.collection.updateOne(
      { _id: new ObjectId(budgetId), userId },
      {
        $set: {
          categories: resetCategories,
          totalSpent: 0,
          updatedAt: new Date(),
        },
      },
    );

    return result.modifiedCount === 1;
  }

  /**
   * Bulk update spent amounts for multiple categories.
   *
   * NOTE: This replaces the entire categories array which is intentional for
   * a full recalculation. Callers should ensure no other writes are in-flight
   * for this budget when calling this method (e.g., call after resetSpentAmounts
   * during a recalculation window).
   */
  async bulkUpdateCategorySpent(
    budgetId: string,
    userId: string,
    categoryUpdates: { transactionCategoryId: string; amount: number }[],
  ): Promise<boolean> {
    const budget = await this.findById(budgetId, userId);
    if (!budget) {
      return false;
    }

    let newTotalSpent = 0;
    const updatedCategories = budget.categories.map((category) => {
      const relevantUpdates = categoryUpdates.filter((u) => {
        if (category.categoryIds && Array.isArray(category.categoryIds)) {
          return category.categoryIds.includes(u.transactionCategoryId);
        }
        return (category as any).categoryId === u.transactionCategoryId;
      });

      if (relevantUpdates.length > 0) {
        const totalUpdate = relevantUpdates.reduce((sum, update) => sum + update.amount, 0);
        const newSpent = Math.max(0, category.spent + totalUpdate);
        newTotalSpent += newSpent;
        return { ...category, spent: newSpent };
      } else {
        newTotalSpent += category.spent;
        return category;
      }
    });

    const result = await this.collection.updateOne(
      { _id: new ObjectId(budgetId), userId },
      {
        $set: {
          categories: updatedCategories,
          totalSpent: newTotalSpent,
          updatedAt: new Date(),
        },
      },
    );

    return result.modifiedCount === 1;
  }

  /**
   * Get all budget categories for a user's budgets
   */
  async getAllUserBudgetCategories(
    userId: string,
  ): Promise<{ budgetId: string; transactionCategoryIds: string[] }[]> {
    const budgets = await this.collection.find({ userId }).toArray();
    const categoryMappings: { budgetId: string; transactionCategoryIds: string[] }[] = [];

    for (const budget of budgets) {
      for (const category of budget.categories) {
        categoryMappings.push({
          budgetId: budget._id!.toString(),
          transactionCategoryIds: category.categoryIds,
        });
      }
    }

    return categoryMappings;
  }

  /**
   * Find budgets by transaction category ID
   */
  async findBudgetsByCategoryId(userId: string, transactionCategoryId: string): Promise<Budget[]> {
    return this.collection
      .find({
        userId,
        'categories.categoryIds': transactionCategoryId,
      })
      .toArray();
  }

  /**
   * Update budget totals (recalculate totalAllocated and totalSpent)
   */
  async recalculateBudgetTotals(budgetId: string, userId: string): Promise<boolean> {
    const budget = await this.findById(budgetId, userId);
    if (!budget) {
      return false;
    }

    let totalAllocated = 0;
    let totalSpent = 0;

    for (const category of budget.categories) {
      totalAllocated += category.allocated;
      totalSpent += category.spent;
    }

    const result = await this.collection.updateOne(
      { _id: new ObjectId(budgetId), userId },
      {
        $set: {
          totalAllocated,
          totalSpent,
          updatedAt: new Date(),
        },
      },
    );

    return result.modifiedCount === 1;
  }
}
