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
    await this.collection.createIndex({ 'categories.categoryId': 1 });
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

  async findById(id: string): Promise<Budget | null> {
    return this.collection.findOne({
      _id: new ObjectId(id),
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

    return updatedBudget.value;
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
    categoryId: string,
    amount: number,
  ): Promise<boolean> {
    // Find the budget
    const budget = await this.findById(budgetId);
    if (!budget) {
      return false;
    }

    // Find the category in the budget
    const categoryIndex = budget.categories.findIndex((c) => c.categoryId === categoryId);
    if (categoryIndex === -1) {
      return false;
    }

    // Update the category spent amount
    const newSpent = budget.categories[categoryIndex].spent + amount;
    const result = await this.collection.updateOne(
      {
        _id: new ObjectId(budgetId),
        userId,
        'categories.categoryId': categoryId,
      },
      {
        $set: {
          'categories.$.spent': newSpent,
          totalSpent: budget.totalSpent + amount,
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

    if (!result.value) {
      return null;
    }

    // Find the added category
    const addedCategory = result.value.categories.find(
      (c) => c._id?.toString() === categoryWithId._id.toString(),
    );

    return addedCategory || null;
  }

  async updateCategory(
    budgetId: string,
    userId: string,
    categoryId: string,
    updates: Partial<Omit<Budget['categories'][0], '_id' | 'categoryId' | 'spent'>>,
  ): Promise<Budget['categories'][0] | null> {
    // First get the current budget to calculate allocation difference
    const budget = await this.findById(budgetId);
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

    // Update the category
    const updateObject: any = {};

    // Set up each field update
    for (const [key, value] of Object.entries(updates)) {
      updateObject[`categories.$.${key}`] = value;
    }

    // Add updatedAt
    updateObject.updatedAt = new Date();

    // Update totalAllocated if needed
    if (allocatedDifference !== 0) {
      updateObject.totalAllocated = budget.totalAllocated + allocatedDifference;
    }

    const result = await this.collection.findOneAndUpdate(
      {
        _id: new ObjectId(budgetId),
        userId,
        'categories._id': new ObjectId(categoryId),
      },
      { $set: updateObject },
      { returnDocument: 'after' },
    );

    if (!result.value) {
      return null;
    }

    // Find the updated category
    const updatedCategory = result.value.categories.find((c) => c._id?.toString() === categoryId);
    return updatedCategory || null;
  }

  async deleteCategory(budgetId: string, userId: string, categoryId: string): Promise<boolean> {
    // First get the current budget to calculate new totalAllocated
    const budget = await this.findById(budgetId);
    if (!budget) {
      return false;
    }

    // Find the category
    const category = budget.categories.find((c) => c._id?.toString() === categoryId);
    if (!category) {
      return false;
    }

    // Remove the category and update totalAllocated
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

    return result.modifiedCount === 1;
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
   * Adjust the spent amount for a specific category in a budget
   * This method ensures spent amounts never go negative
   */
  async adjustCategorySpent(
    budgetId: string,
    userId: string,
    categoryId: string,
    amount: number,
  ): Promise<boolean> {
    const budget = await this.findById(budgetId);
    if (!budget) {
      return false;
    }

    // Find the budget category for this transaction category
    const categoryIndex = budget.categories.findIndex((c) => c.categoryId === categoryId);
    if (categoryIndex === -1) {
      // Category not in budget, skip
      return false;
    }

    // Calculate new spent amount, ensuring it doesn't go negative
    const currentSpent = budget.categories[categoryIndex].spent;
    const newSpent = Math.max(0, currentSpent + amount);
    const actualChange = newSpent - currentSpent;

    // Update the category spent amount and total spent
    const result = await this.collection.updateOne(
      {
        _id: new ObjectId(budgetId),
        userId,
        'categories.categoryId': categoryId,
      },
      {
        $set: {
          'categories.$.spent': newSpent,
          totalSpent: Math.max(0, budget.totalSpent + actualChange),
          updatedAt: new Date(),
        },
      },
    );

    return result.modifiedCount === 1;
  }

  /**
   * Get budget category by categoryId for a specific budget
   */
  async getBudgetCategory(
    budgetId: string,
    categoryId: string,
  ): Promise<Budget['categories'][0] | null> {
    const budget = await this.findById(budgetId);
    if (!budget) {
      return null;
    }

    return budget.categories.find((c) => c.categoryId === categoryId) || null;
  }

  /**
   * Check if a budget contains a specific category
   */
  async hasBudgetCategory(budgetId: string, categoryId: string): Promise<boolean> {
    const category = await this.getBudgetCategory(budgetId, categoryId);
    return category !== null;
  }

  /**
   * Reset all spent amounts for a budget (useful for budget recalculation)
   */
  async resetSpentAmounts(budgetId: string, userId: string): Promise<boolean> {
    const budget = await this.findById(budgetId);
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
   * Bulk update spent amounts for multiple categories
   */
  async bulkUpdateCategorySpent(
    budgetId: string,
    userId: string,
    categoryUpdates: { categoryId: string; amount: number }[],
  ): Promise<boolean> {
    const budget = await this.findById(budgetId);
    if (!budget) {
      return false;
    }

    let newTotalSpent = 0;
    const updatedCategories = budget.categories.map((category) => {
      const update = categoryUpdates.find((u) => u.categoryId === category.categoryId);
      if (update) {
        const newSpent = Math.max(0, category.spent + update.amount);
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
  ): Promise<{ budgetId: string; categoryId: string }[]> {
    const budgets = await this.collection.find({ userId }).toArray();
    const categoryMappings: { budgetId: string; categoryId: string }[] = [];

    for (const budget of budgets) {
      for (const category of budget.categories) {
        categoryMappings.push({
          budgetId: budget._id!.toString(),
          categoryId: category.categoryId,
        });
      }
    }

    return categoryMappings;
  }

  /**
   * Find budgets by category ID
   */
  async findBudgetsByCategoryId(userId: string, categoryId: string): Promise<Budget[]> {
    return this.collection
      .find({
        userId,
        'categories.categoryId': categoryId,
      })
      .toArray();
  }

  /**
   * Update budget totals (recalculate totalAllocated and totalSpent)
   */
  async recalculateBudgetTotals(budgetId: string): Promise<boolean> {
    const budget = await this.findById(budgetId);
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
      { _id: new ObjectId(budgetId) },
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
