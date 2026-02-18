import { Db } from 'mongodb';

import { CategoryModel } from '../transactions/category-db';
import { TransactionModel } from '../transactions/db';
import { BudgetModel } from './db';
import {
  Budget,
  BudgetCategory,
  BudgetCategoryDTO,
  BudgetDTO,
  BudgetSummaryDTO,
  BudgetsResponse,
  CreateBudgetCategoryRequest,
  CreateBudgetRequest,
  GetBudgetsQuery,
  UpdateBudgetCategoryRequest,
  UpdateBudgetRequest,
} from './types/interface';

export class BudgetService {
  private budgetModel: BudgetModel;
  private transactionModel: TransactionModel;
  private categoryModel: CategoryModel;

  constructor(db: Db) {
    this.budgetModel = new BudgetModel(db);
    this.transactionModel = new TransactionModel(db);
    this.categoryModel = new CategoryModel(db);
  }

  async initialize(): Promise<void> {
    await this.budgetModel.initialize();
  }

  async getCurrentBudget(userId: string): Promise<BudgetDTO | null> {
    const budget = await this.budgetModel.findCurrent(userId);

    if (!budget) {
      return null;
    }

    return this.mapBudgetToDTO(budget);
  }

  async getBudgets(userId: string, query: GetBudgetsQuery): Promise<BudgetsResponse> {
    const data = await this.budgetModel.findAll(userId, query);
    const budgetDTOs = data.items.map(this.mapBudgetToSummaryDTO);

    return {
      ...data,
      items: budgetDTOs,
    };
  }

  async getBudgetById(id: string): Promise<BudgetDTO> {
    const budget = await this.budgetModel.findById(id);
    if (!budget) {
      throw new Error('Budget not found');
    }

    return this.mapBudgetToDTO(budget);
  }

  async createBudget(userId: string, budgetData: CreateBudgetRequest): Promise<BudgetDTO> {
    // Validate dates
    const startDate = new Date(budgetData.startDate);
    const endDate = new Date(budgetData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }

    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    // Check for overlapping budget periods
    const hasOverlap = await this.budgetModel.checkOverlappingBudgets(userId, startDate, endDate);
    if (hasOverlap) {
      throw new Error('Budget period overlaps with an existing budget');
    }

    // Validate categories
    const allCategoryIds: string[] = [];

    // Collect all categoryIds from all budget categories
    for (const budgetCategory of budgetData.categories) {
      if (!Array.isArray(budgetCategory.categoryIds) || budgetCategory.categoryIds.length === 0) {
        throw new Error(
          `Budget category "${budgetCategory.name}" must have at least one categoryId`,
        );
      }
      allCategoryIds.push(...budgetCategory.categoryIds);
    }

    // Validate that all categoryIds exist
    for (const categoryId of allCategoryIds) {
      const category = await this.categoryModel.findById(categoryId, userId);
      if (!category) {
        throw new Error(`Category with ID ${categoryId} not found`);
      }
    }

    // Calculate total allocated
    const totalAllocated = budgetData.categories.reduce(
      (sum, category) => sum + category.allocated,
      0,
    );

    // Prepare budget categories with spent = 0
    const categories: BudgetCategory[] = budgetData.categories.map((c) => ({
      ...c,
      spent: 0,
    }));

    // Create budget
    const budget: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'> = {
      userId,
      name: budgetData.name,
      startDate,
      endDate,
      categories,
      totalAllocated,
      totalSpent: 0,
      income: budgetData.income,
    };

    const createdBudget = await this.budgetModel.create(budget);

    // After creating the budget, calculate the initial spent values based on existing transactions
    // This is important to show accurate spent values if the budget covers past dates
    await this.updateBudgetSpentAmounts(createdBudget._id!.toString(), userId);

    // Fetch the updated budget with accurate spent values
    const updatedBudget = await this.budgetModel.findById(createdBudget._id!.toString());
    if (!updatedBudget) {
      throw new Error('Failed to retrieve created budget');
    }

    return this.mapBudgetToDTO(updatedBudget);
  }

  async updateBudget(id: string, userId: string, updates: UpdateBudgetRequest): Promise<BudgetDTO> {
    const budget = await this.budgetModel.findById(id);
    if (!budget) {
      throw new Error('Budget not found');
    }

    // Prepare updates
    const budgetUpdates: Partial<Budget> = {};

    // Handle name update
    if (updates.name !== undefined) {
      budgetUpdates.name = updates.name;
    }

    // Handle date updates
    let startDate = budget.startDate;
    let endDate = budget.endDate;

    if (updates.startDate) {
      startDate = new Date(updates.startDate);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start date format');
      }
      budgetUpdates.startDate = startDate;
    }

    if (updates.endDate) {
      endDate = new Date(updates.endDate);
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end date format');
      }
      budgetUpdates.endDate = endDate;
    }

    // Validate date order
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    // Check for overlapping budget periods
    if (updates.startDate || updates.endDate) {
      const hasOverlap = await this.budgetModel.checkOverlappingBudgets(
        userId,
        startDate,
        endDate,
        id, // Exclude current budget from overlap check
      );
      if (hasOverlap) {
        throw new Error('Budget period overlaps with an existing budget');
      }
    }

    // Handle income update
    if (updates.income !== undefined) {
      budgetUpdates.income = updates.income;
    }

    // Apply updates
    const updatedBudget = await this.budgetModel.update(id, userId, budgetUpdates);

    if (!updatedBudget) {
      throw new Error('Failed to update budget');
    }

    // If dates changed, update the spent amounts based on the new date range
    if (updates.startDate || updates.endDate) {
      await this.updateBudgetSpentAmounts(id, userId);
      const refreshedBudget = await this.budgetModel.findById(id);
      if (!refreshedBudget) {
        throw new Error('Failed to retrieve updated budget');
      }
      return this.mapBudgetToDTO(refreshedBudget);
    }

    return this.mapBudgetToDTO(updatedBudget);
  }

  async deleteBudget(id: string, userId: string): Promise<void> {
    const budget = await this.budgetModel.findById(id);
    if (!budget) {
      throw new Error('Budget not found');
    }

    const deleted = await this.budgetModel.delete(id, userId);

    if (!deleted) {
      throw new Error('Failed to delete budget');
    }
  }

  async createBudgetCategory(
    budgetId: string,
    userId: string,
    categoryData: CreateBudgetCategoryRequest,
  ): Promise<BudgetCategoryDTO> {
    const budget = await this.budgetModel.findById(budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    // Validate that all transaction categories exist
    for (const categoryId of categoryData.categoryIds) {
      const transactionCategory = await this.categoryModel.findById(categoryId, userId);
      if (!transactionCategory) {
        throw new Error(`Transaction category with ID ${categoryId} not found`);
      }
    }

    // Check if any of the categoryIds are already used in existing budget categories
    for (const categoryId of categoryData.categoryIds) {
      const existingCategory = budget.categories.find((c) => {
        // Handle backward compatibility - some categories might still have the old categoryId field
        if (c.categoryIds && Array.isArray(c.categoryIds)) {
          return c.categoryIds.includes(categoryId);
        }
        // Fallback for old format (single categoryId)
        if ((c as any).categoryId) {
          return (c as any).categoryId === categoryId;
        }
        return false;
      });
      if (existingCategory) {
        throw new Error(
          `Transaction category ${categoryId} is already assigned to budget category "${existingCategory.name}"`,
        );
      }
    }

    // Create the budget category
    const newCategory: Omit<BudgetCategory, '_id'> = {
      name: categoryData.name,
      allocated: categoryData.allocated,
      spent: 0, // Initially zero
      categoryIds: categoryData.categoryIds,
      color: categoryData.color,
      icon: categoryData.icon,
      rollover: categoryData.rollover,
      notes: categoryData.notes,
    };

    const createdCategory = await this.budgetModel.addCategory(budgetId, userId, newCategory);

    if (!createdCategory) {
      throw new Error('Failed to create budget category');
    }

    // Update the spent amount for the new category (for all its categoryIds)
    await this.updateCategorySpentAmount(budgetId, userId, createdCategory.categoryIds);

    // Get the updated category with actual spent amount
    const updatedBudget = await this.budgetModel.findById(budgetId);
    if (!updatedBudget) {
      throw new Error('Failed to retrieve updated budget');
    }

    const updatedCategory = updatedBudget.categories.find(
      (c) => c._id?.toString() === createdCategory._id?.toString(),
    );

    if (!updatedCategory) {
      throw new Error('Failed to retrieve created category');
    }

    return this.mapBudgetCategoryToDTO(updatedCategory);
  }

  async updateBudgetCategory(
    budgetId: string,
    categoryId: string,
    userId: string,
    updates: UpdateBudgetCategoryRequest,
  ): Promise<BudgetCategoryDTO> {
    const budget = await this.budgetModel.findById(budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    // Find the category
    const category = budget.categories.find((c) => c._id?.toString() === categoryId);
    if (!category) {
      throw new Error('Budget category not found');
    }

    // Prepare updates
    const categoryUpdates: Partial<BudgetCategory> = {};

    if (updates.name !== undefined) {
      categoryUpdates.name = updates.name;
    }

    if (updates.allocated !== undefined) {
      categoryUpdates.allocated = updates.allocated;
    }

    if (updates.color !== undefined) {
      categoryUpdates.color = updates.color;
    }

    if (updates.icon !== undefined) {
      categoryUpdates.icon = updates.icon;
    }

    if (updates.rollover !== undefined) {
      categoryUpdates.rollover = updates.rollover;
    }

    if (updates.notes !== undefined) {
      categoryUpdates.notes = updates.notes;
    }

    // Apply updates
    const updatedCategory = await this.budgetModel.updateCategory(
      budgetId,
      userId,
      categoryId,
      categoryUpdates,
    );

    if (!updatedCategory) {
      throw new Error('Failed to update budget category');
    }

    return this.mapBudgetCategoryToDTO(updatedCategory);
  }

  async deleteBudgetCategory(budgetId: string, categoryId: string, userId: string): Promise<void> {
    const budget = await this.budgetModel.findById(budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    // Find the category
    const category = budget.categories.find((c) => c._id?.toString() === categoryId);
    if (!category) {
      throw new Error('Budget category not found');
    }

    const deleted = await this.budgetModel.deleteCategory(budgetId, userId, categoryId);

    if (!deleted) {
      throw new Error('Failed to delete budget category');
    }
  }

  private async updateBudgetSpentAmounts(budgetId: string, userId: string): Promise<void> {
    const budget = await this.budgetModel.findById(budgetId);
    if (!budget) {
      return;
    }

    // Reset all spent amounts to zero
    const updatedCategories = budget.categories.map((category) => ({
      ...category,
      spent: 0,
    }));

    const resetBudget = await this.budgetModel.update(budgetId, userId, {
      categories: updatedCategories,
      totalSpent: 0,
    });

    if (!resetBudget) {
      return;
    }

    // Fetch transactions within the budget period
    const transactions = await this.transactionModel.findByDateRange(
      userId,
      budget.startDate,
      budget.endDate,
    );

    // Group transactions by category
    const categoryTotals = new Map<string, number>();

    for (const transaction of transactions) {
      // Only consider expense transactions
      if (transaction.type !== 'expense') {
        continue;
      }

      const categoryId = transaction.categoryId;
      const currentTotal = categoryTotals.get(categoryId) || 0;
      categoryTotals.set(categoryId, currentTotal + transaction.amount);
    }

    // Update each category's spent amount
    let totalSpent = 0;

    for (const [categoryId, amount] of categoryTotals.entries()) {
      // Find the budget category that contains this transaction category
      const budgetCategory = budget.categories.find((c) => {
        // Handle backward compatibility - some categories might still have the old categoryId field
        if (c.categoryIds && Array.isArray(c.categoryIds)) {
          return c.categoryIds.includes(categoryId);
        }
        // Fallback for old format (single categoryId)
        if ((c as any).categoryId) {
          return (c as any).categoryId === categoryId;
        }
        return false;
      });
      if (budgetCategory) {
        // Add to the budget category's spent amount (it may have multiple transaction categories)
        const currentSpent = budgetCategory.spent || 0;
        const newSpent = currentSpent + amount;
        await this.budgetModel.updateCategorySpent(
          budgetId,
          userId,
          budgetCategory._id!.toString(),
          newSpent,
        );
        totalSpent += amount;
      }
    }

    // Update the total spent amount
    await this.budgetModel.update(budgetId, userId, { totalSpent });
  }

  private async updateCategorySpentAmount(
    budgetId: string,
    userId: string,
    categoryIds: string[],
  ): Promise<void> {
    const budget = await this.budgetModel.findById(budgetId);
    if (!budget) {
      return;
    }

    // Find the budget category that contains these categoryIds
    const budgetCategory = budget.categories.find((c) =>
      categoryIds.some((catId) => {
        // Handle backward compatibility - some categories might still have the old categoryId field
        if (c.categoryIds && Array.isArray(c.categoryIds)) {
          return c.categoryIds.includes(catId);
        }
        // Fallback for old format (single categoryId)
        if ((c as any).categoryId) {
          return (c as any).categoryId === catId;
        }
        return false;
      }),
    );
    if (!budgetCategory) {
      return;
    }

    // Reset the category spent amount
    const resetResult = await this.budgetModel.updateCategory(
      budgetId,
      userId,
      budgetCategory._id!.toString(),
      { spent: 0 } as Partial<BudgetCategory>,
    );

    if (!resetResult) {
      return;
    }

    // Fetch transactions within the budget period for all categoryIds in this budget category
    let totalSpent = 0;

    // Get the category IDs for this budget category (handle backward compatibility)
    const categoryIdsToProcess =
      budgetCategory.categoryIds && Array.isArray(budgetCategory.categoryIds)
        ? budgetCategory.categoryIds
        : [(budgetCategory as any).categoryId].filter(Boolean);

    for (const categoryId of categoryIdsToProcess) {
      const transactions = await this.transactionModel.findByDateRangeAndCategory(
        userId,
        budget.startDate,
        budget.endDate,
        categoryId,
      );

      // Calculate total spent for this category
      for (const transaction of transactions) {
        if (transaction.type === 'expense') {
          totalSpent += transaction.amount;
        }
      }
    }

    // Update the category spent amount with the total from all its transaction categories
    await this.budgetModel.updateCategorySpent(
      budgetId,
      userId,
      budgetCategory._id!.toString(),
      totalSpent,
    );

    // Update the budget's total spent
    const oldTotalSpent = budget.totalSpent - budgetCategory.spent;
    const newTotalSpent = oldTotalSpent + totalSpent;
    await this.budgetModel.update(budgetId, userId, {
      totalSpent: newTotalSpent,
    });
  }

  private mapBudgetToDTO(budget: Budget): BudgetDTO {
    return {
      id: budget._id!.toString(),
      name: budget.name,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate.toISOString(),
      categories: budget.categories.map(this.mapBudgetCategoryToDTO),
      totalAllocated: budget.totalAllocated,
      totalSpent: budget.totalSpent,
      income: budget.income,
    };
  }

  private mapBudgetToSummaryDTO(budget: Budget): BudgetSummaryDTO {
    return {
      id: budget._id!.toString(),
      name: budget.name,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate.toISOString(),
      totalAllocated: budget.totalAllocated,
      totalSpent: budget.totalSpent,
      income: budget.income,
    };
  }

  private mapBudgetCategoryToDTO(category: BudgetCategory): BudgetCategoryDTO {
    return {
      id: category._id!.toString(),
      name: category.name,
      allocated: category.allocated,
      spent: category.spent,
      categoryIds: category.categoryIds,
      color: category.color,
      icon: category.icon,
      rollover: category.rollover,
      notes: category.notes,
    };
  }
}
