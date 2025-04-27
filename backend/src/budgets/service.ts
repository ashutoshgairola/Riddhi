import { Db } from "mongodb";
import {
  Budget,
  BudgetDTO,
  BudgetSummaryDTO,
  BudgetCategory,
  BudgetCategoryDTO,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  CreateBudgetCategoryRequest,
  UpdateBudgetCategoryRequest,
  GetBudgetsQuery,
  BudgetsResponse,
} from "./types/interface";

import { BudgetModel } from "./db";
import { TransactionModel } from "../transactions/db";
import { CategoryModel } from "../transactions/category-db";

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

  async getBudgets(
    userId: string,
    query: GetBudgetsQuery
  ): Promise<BudgetsResponse> {
    const { budgets, pagination } = await this.budgetModel.findAll(
      userId,
      query
    );
    const budgetDTOs = budgets.map(this.mapBudgetToSummaryDTO);

    return {
      data: budgetDTOs,
      pagination,
    };
  }

  async getBudgetById(id: string, userId: string): Promise<BudgetDTO> {
    const budget = await this.budgetModel.findById(id, userId);
    if (!budget) {
      throw new Error("Budget not found");
    }

    return this.mapBudgetToDTO(budget);
  }

  async createBudget(
    userId: string,
    budgetData: CreateBudgetRequest
  ): Promise<BudgetDTO> {
    // Validate dates
    const startDate = new Date(budgetData.startDate);
    const endDate = new Date(budgetData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format");
    }

    if (startDate >= endDate) {
      throw new Error("Start date must be before end date");
    }

    // Check for overlapping budget periods
    const hasOverlap = await this.budgetModel.checkOverlappingBudgets(
      userId,
      startDate,
      endDate
    );
    if (hasOverlap) {
      throw new Error("Budget period overlaps with an existing budget");
    }

    // Validate categories
    const categoryIds = budgetData.categories.map((c) => c.categoryId);
    for (const categoryId of categoryIds) {
      const category = await this.categoryModel.findById(categoryId, userId);
      if (!category) {
        throw new Error(`Category with ID ${categoryId} not found`);
      }
    }

    // Calculate total allocated
    const totalAllocated = budgetData.categories.reduce(
      (sum, category) => sum + category.allocated,
      0
    );

    // Prepare budget categories with spent = 0
    const categories: BudgetCategory[] = budgetData.categories.map((c) => ({
      ...c,
      spent: 0,
    }));

    // Create budget
    const budget: Omit<Budget, "_id" | "createdAt" | "updatedAt"> = {
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
    const updatedBudget = await this.budgetModel.findById(
      createdBudget._id!.toString(),
      userId
    );
    if (!updatedBudget) {
      throw new Error("Failed to retrieve created budget");
    }

    return this.mapBudgetToDTO(updatedBudget);
  }

  async updateBudget(
    id: string,
    userId: string,
    updates: UpdateBudgetRequest
  ): Promise<BudgetDTO> {
    const budget = await this.budgetModel.findById(id, userId);
    if (!budget) {
      throw new Error("Budget not found");
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
        throw new Error("Invalid start date format");
      }
      budgetUpdates.startDate = startDate;
    }

    if (updates.endDate) {
      endDate = new Date(updates.endDate);
      if (isNaN(endDate.getTime())) {
        throw new Error("Invalid end date format");
      }
      budgetUpdates.endDate = endDate;
    }

    // Validate date order
    if (startDate >= endDate) {
      throw new Error("Start date must be before end date");
    }

    // Check for overlapping budget periods
    if (updates.startDate || updates.endDate) {
      const hasOverlap = await this.budgetModel.checkOverlappingBudgets(
        userId,
        startDate,
        endDate,
        id // Exclude current budget from overlap check
      );
      if (hasOverlap) {
        throw new Error("Budget period overlaps with an existing budget");
      }
    }

    // Handle income update
    if (updates.income !== undefined) {
      budgetUpdates.income = updates.income;
    }

    // Apply updates
    const updatedBudget = await this.budgetModel.update(
      id,
      userId,
      budgetUpdates
    );

    if (!updatedBudget) {
      throw new Error("Failed to update budget");
    }

    // If dates changed, update the spent amounts based on the new date range
    if (updates.startDate || updates.endDate) {
      await this.updateBudgetSpentAmounts(id, userId);
      const refreshedBudget = await this.budgetModel.findById(id, userId);
      if (!refreshedBudget) {
        throw new Error("Failed to retrieve updated budget");
      }
      return this.mapBudgetToDTO(refreshedBudget);
    }

    return this.mapBudgetToDTO(updatedBudget);
  }

  async deleteBudget(id: string, userId: string): Promise<void> {
    const budget = await this.budgetModel.findById(id, userId);
    if (!budget) {
      throw new Error("Budget not found");
    }

    const deleted = await this.budgetModel.delete(id, userId);

    if (!deleted) {
      throw new Error("Failed to delete budget");
    }
  }

  async createBudgetCategory(
    budgetId: string,
    userId: string,
    categoryData: CreateBudgetCategoryRequest
  ): Promise<BudgetCategoryDTO> {
    const budget = await this.budgetModel.findById(budgetId, userId);
    if (!budget) {
      throw new Error("Budget not found");
    }

    // Validate that the transaction category exists
    const transactionCategory = await this.categoryModel.findById(
      categoryData.categoryId,
      userId
    );
    if (!transactionCategory) {
      throw new Error("Transaction category not found");
    }

    // Check if a budget category with this category ID already exists
    const existingCategory = budget.categories.find(
      (c) => c.categoryId === categoryData.categoryId
    );
    if (existingCategory) {
      throw new Error(
        "A budget category for this transaction category already exists"
      );
    }

    // Create the budget category
    const newCategory: Omit<BudgetCategory, "_id"> = {
      name: categoryData.name,
      allocated: categoryData.allocated,
      spent: 0, // Initially zero
      categoryId: categoryData.categoryId,
      color: categoryData.color,
      icon: categoryData.icon,
      rollover: categoryData.rollover,
      notes: categoryData.notes,
    };

    const createdCategory = await this.budgetModel.addCategory(
      budgetId,
      userId,
      newCategory
    );

    if (!createdCategory) {
      throw new Error("Failed to create budget category");
    }

    // Update the spent amount for the new category
    await this.updateCategorySpentAmount(
      budgetId,
      userId,
      createdCategory.categoryId
    );

    // Get the updated category with actual spent amount
    const updatedBudget = await this.budgetModel.findById(budgetId, userId);
    if (!updatedBudget) {
      throw new Error("Failed to retrieve updated budget");
    }

    const updatedCategory = updatedBudget.categories.find(
      (c) => c._id?.toString() === createdCategory._id?.toString()
    );

    if (!updatedCategory) {
      throw new Error("Failed to retrieve created category");
    }

    return this.mapBudgetCategoryToDTO(updatedCategory);
  }

  async updateBudgetCategory(
    budgetId: string,
    categoryId: string,
    userId: string,
    updates: UpdateBudgetCategoryRequest
  ): Promise<BudgetCategoryDTO> {
    const budget = await this.budgetModel.findById(budgetId, userId);
    if (!budget) {
      throw new Error("Budget not found");
    }

    // Find the category
    const category = budget.categories.find(
      (c) => c._id?.toString() === categoryId
    );
    if (!category) {
      throw new Error("Budget category not found");
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
      categoryUpdates
    );

    if (!updatedCategory) {
      throw new Error("Failed to update budget category");
    }

    return this.mapBudgetCategoryToDTO(updatedCategory);
  }

  async deleteBudgetCategory(
    budgetId: string,
    categoryId: string,
    userId: string
  ): Promise<void> {
    const budget = await this.budgetModel.findById(budgetId, userId);
    if (!budget) {
      throw new Error("Budget not found");
    }

    // Find the category
    const category = budget.categories.find(
      (c) => c._id?.toString() === categoryId
    );
    if (!category) {
      throw new Error("Budget category not found");
    }

    const deleted = await this.budgetModel.deleteCategory(
      budgetId,
      userId,
      categoryId
    );

    if (!deleted) {
      throw new Error("Failed to delete budget category");
    }
  }

  private async updateBudgetSpentAmounts(
    budgetId: string,
    userId: string
  ): Promise<void> {
    const budget = await this.budgetModel.findById(budgetId, userId);
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
      budget.endDate
    );

    // Group transactions by category
    const categoryTotals = new Map<string, number>();

    for (const transaction of transactions) {
      // Only consider expense transactions
      if (transaction.type !== "expense") {
        continue;
      }

      const categoryId = transaction.categoryId;
      const currentTotal = categoryTotals.get(categoryId) || 0;
      categoryTotals.set(categoryId, currentTotal + transaction.amount);
    }

    // Update each category's spent amount
    let totalSpent = 0;

    for (const [categoryId, amount] of categoryTotals.entries()) {
      // Find the budget category for this transaction category
      const budgetCategory = budget.categories.find(
        (c) => c.categoryId === categoryId
      );
      if (budgetCategory) {
        await this.budgetModel.updateCategorySpent(
          budgetId,
          userId,
          categoryId,
          amount
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
    categoryId: string
  ): Promise<void> {
    const budget = await this.budgetModel.findById(budgetId, userId);
    if (!budget) {
      return;
    }

    // Find the budget category
    const budgetCategory = budget.categories.find(
      (c) => c.categoryId === categoryId
    );
    if (!budgetCategory) {
      return;
    }

    // Reset the category spent amount
    const resetResult = await this.budgetModel.updateCategory(
      budgetId,
      userId,
      budgetCategory._id!.toString(),
      { spent: 0 } as Partial<BudgetCategory>
    );

    if (!resetResult) {
      return;
    }

    // Fetch transactions within the budget period for this category
    const transactions = await this.transactionModel.findByDateRangeAndCategory(
      userId,
      budget.startDate,
      budget.endDate,
      categoryId
    );

    // Calculate total spent for this category
    let totalSpent = 0;
    for (const transaction of transactions) {
      if (transaction.type === "expense") {
        totalSpent += transaction.amount;
      }
    }

    // Update the category spent amount
    await this.budgetModel.updateCategorySpent(
      budgetId,
      userId,
      categoryId,
      totalSpent
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
      categoryId: category.categoryId,
      color: category.color,
      icon: category.icon,
      rollover: category.rollover,
      notes: category.notes,
    };
  }
}
