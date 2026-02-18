import { Request, Response } from 'express';

import { sendResponse } from '../common/utils';
import { log } from '../config/logger';
import { BudgetService } from './service';
import {
  CreateBudgetCategoryRequest,
  CreateBudgetRequest,
  GetBudgetsQuery,
  UpdateBudgetCategoryRequest,
  UpdateBudgetRequest,
} from './types/interface';

export class BudgetController {
  private readonly context = BudgetController.name;
  private budgetService: BudgetService;

  constructor(budgetService: BudgetService) {
    this.budgetService = budgetService;
  }

  getCurrentBudget = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      log.info('💰 Getting current budget', {
        context: this.context,
        method: 'getCurrentBudget',
        userId,
      });

      const budget = await this.budgetService.getCurrentBudget(userId);

      log.info('✅ Current budget fetched successfully', {
        context: this.context,
        method: 'getCurrentBudget',
        userId,
        hasBudget: !!budget,
      });

      sendResponse({
        res,
        data: budget,
        message: 'Current budget fetched successfully',
      });
    } catch (error: any) {
      log.error('💥 Error fetching current budget', {
        context: this.context,
        method: 'getCurrentBudget',
        error,
        userId: req.body.user?.userId,
      });
      res.status(500).json({ error: 'Failed to fetch current budget' });
    }
  };

  getBudgets = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      const query: GetBudgetsQuery = req.query as any;

      log.info('📋 Getting budgets list', {
        context: this.context,
        method: 'getBudgets',
        userId,
        query,
      });

      // Convert numeric query params
      if (query.page) {
        query.page = parseInt(query.page as any, 10);
      }

      if (query.limit) {
        query.limit = parseInt(query.limit as any, 10);
      }

      const budgets = await this.budgetService.getBudgets(userId, query);

      log.info('✅ Budgets fetched successfully', {
        context: this.context,
        method: 'getBudgets',
        userId,
        count: budgets.items.length,
        total: budgets.total,
      });

      sendResponse({
        res,
        data: budgets,
        message: 'Budgets fetched successfully',
      });
    } catch (error: any) {
      log.error('💥 Error fetching budgets', {
        context: this.context,
        method: 'getBudgets',
        error,
        userId: req.body.user?.userId,
      });
      res.status(500).json({ error: 'Failed to fetch budgets' });
    }
  };

  getBudgetById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      log.info('🔍 Getting budget by ID', {
        context: this.context,
        method: 'getBudgetById',
        budgetId: id,
      });

      try {
        const budget = await this.budgetService.getBudgetById(id);

        log.info('✅ Budget fetched successfully', {
          context: this.context,
          method: 'getBudgetById',
          budgetId: id,
          budgetName: budget.name,
        });

        sendResponse({
          res,
          data: budget,
          message: 'Budget fetched successfully',
        });
      } catch (error: any) {
        if (error.message === 'Budget not found') {
          log.warn('⚠️ Budget not found', {
            context: this.context,
            method: 'getBudgetById',
            budgetId: id,
            error: error.message,
          });
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      log.error('💥 Error fetching budget', {
        context: this.context,
        method: 'getBudgetById',
        error,
        budgetId: req.params.id,
      });
      res.status(500).json({ error: 'Failed to fetch budget' });
    }
  };

  createBudget = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      const budgetData: CreateBudgetRequest = req.body;

      log.info('💰 Creating budget', {
        context: this.context,
        method: 'createBudget',
        userId,
        budgetName: budgetData.name,
        categoriesCount: budgetData.categories?.length,
      });

      // Basic validation
      if (
        !budgetData.name ||
        !budgetData.startDate ||
        !budgetData.endDate ||
        !Array.isArray(budgetData.categories) ||
        budgetData.income === undefined
      ) {
        log.warn('❌ Budget creation failed: Missing required fields', {
          context: this.context,
          method: 'createBudget',
          userId,
        });
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      try {
        const budget = await this.budgetService.createBudget(userId, budgetData);

        log.info('✅ Budget created successfully', {
          context: this.context,
          method: 'createBudget',
          userId,
          budgetId: budget.id,
          budgetName: budgetData.name,
        });

        sendResponse({
          res,
          status: 201,
          data: budget,
          message: 'Budget created successfully',
        });
      } catch (error: any) {
        if (
          error.message.includes('overlap') ||
          error.message.includes('date') ||
          error.message.includes('Category')
        ) {
          log.warn('⚠️ Budget creation failed: Validation error', {
            context: this.context,
            method: 'createBudget',
            userId,
            error: error.message,
          });
          res.status(400).json({ error: error.message });
        } else if (error.message.includes('conflict') || error.message.includes('overlap')) {
          log.warn('⚠️ Budget creation failed: Conflict error', {
            context: this.context,
            method: 'createBudget',
            userId,
            error: error.message,
          });
          res.status(409).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      log.error('💥 Error creating budget', {
        context: this.context,
        method: 'createBudget',
        error,
        userId: req.body.user?.userId,
      });
      res.status(500).json({ error: 'Failed to create budget' });
    }
  };

  updateBudget = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      const { id } = req.params;
      const updates: UpdateBudgetRequest = req.body;

      log.info('📝 Updating budget', {
        context: this.context,
        method: 'updateBudget',
        userId,
        budgetId: id,
      });

      try {
        const budget = await this.budgetService.updateBudget(id, userId, updates);

        log.info('✅ Budget updated successfully', {
          context: this.context,
          method: 'updateBudget',
          userId,
          budgetId: id,
        });

        sendResponse({
          res,
          data: budget,
          message: 'Budget updated successfully',
        });
      } catch (error: any) {
        if (error.message === 'Budget not found') {
          log.warn('⚠️ Budget not found', {
            context: this.context,
            method: 'updateBudget',
            userId,
            budgetId: id,
            error: error.message,
          });
          res.status(404).json({ error: error.message });
        } else if (error.message.includes('date') || error.message.includes('invalid')) {
          log.warn('⚠️ Budget update failed: Validation error', {
            context: this.context,
            method: 'updateBudget',
            userId,
            budgetId: id,
            error: error.message,
          });
          res.status(400).json({ error: error.message });
        } else if (error.message.includes('overlap')) {
          log.warn('⚠️ Budget update failed: Conflict error', {
            context: this.context,
            method: 'updateBudget',
            userId,
            budgetId: id,
            error: error.message,
          });
          res.status(409).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      log.error('💥 Error updating budget', {
        context: this.context,
        method: 'updateBudget',
        error,
        userId: req.body.user?.userId,
        budgetId: req.params.id,
      });
      res.status(500).json({ error: 'Failed to update budget' });
    }
  };

  deleteBudget = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      const { id } = req.params;

      log.info('🗑️ Deleting budget', {
        context: this.context,
        method: 'deleteBudget',
        userId,
        budgetId: id,
      });

      try {
        await this.budgetService.deleteBudget(id, userId);

        log.info('✅ Budget deleted successfully', {
          context: this.context,
          method: 'deleteBudget',
          userId,
          budgetId: id,
        });

        sendResponse({
          res,
          status: 204,
          data: null,
          message: 'Budget deleted successfully',
        });
      } catch (error: any) {
        if (error.message === 'Budget not found') {
          log.warn('⚠️ Budget not found', {
            context: this.context,
            method: 'deleteBudget',
            userId,
            budgetId: id,
            error: error.message,
          });
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      log.error('💥 Error deleting budget', {
        context: this.context,
        method: 'deleteBudget',
        error,
        userId: req.body.user?.userId,
        budgetId: req.params.id,
      });
      res.status(500).json({ error: 'Failed to delete budget' });
    }
  };

  createBudgetCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user.userId;
      delete req.body.user;
      const { id } = req.params;
      const categoryData: CreateBudgetCategoryRequest = req.body;

      log.info('📊 Creating budget category', {
        context: this.context,
        method: 'createBudgetCategory',
        userId,
        budgetId: id,
        categoryName: categoryData.name,
        categoryIds: categoryData.categoryIds,
      });

      // Basic validation
      if (
        !categoryData.name ||
        categoryData.allocated === undefined ||
        !categoryData.categoryIds ||
        !Array.isArray(categoryData.categoryIds) ||
        categoryData.categoryIds.length === 0
      ) {
        log.warn('❌ Budget category creation failed: Missing required fields', {
          context: this.context,
          method: 'createBudgetCategory',
          userId,
          budgetId: id,
        });
        res
          .status(400)
          .json({
            error:
              'Missing required fields: name, allocated, and categoryIds (must be non-empty array)',
          });
        return;
      }

      try {
        const category = await this.budgetService.createBudgetCategory(id, userId, categoryData);

        log.info('✅ Budget category created successfully', {
          context: this.context,
          method: 'createBudgetCategory',
          userId,
          budgetId: id,
          categoryName: categoryData.name,
          categoryIds: categoryData.categoryIds,
        });

        sendResponse({
          res,
          status: 201,
          data: category,
          message: 'Budget category created successfully',
        });
      } catch (error: any) {
        if (error.message === 'Budget not found') {
          log.warn('⚠️ Budget not found', {
            context: this.context,
            method: 'createBudgetCategory',
            userId,
            budgetId: id,
            error: error.message,
          });
          res.status(404).json({ error: error.message });
        } else if (
          error.message.includes('already exists') ||
          (error.message.includes('not found') && error.message.includes('category'))
        ) {
          log.warn('⚠️ Budget category creation failed: Validation error', {
            context: this.context,
            method: 'createBudgetCategory',
            userId,
            budgetId: id,
            error: error.message,
          });
          res.status(400).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      log.error('💥 Error creating budget category', {
        context: this.context,
        method: 'createBudgetCategory',
        error,
        userId: req.body.user?.userId,
        budgetId: req.params.id,
      });
      res.status(500).json({ error: 'Failed to create budget category' });
    }
  };

  updateBudgetCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      const { budgetId, categoryId } = req.params;
      const updates: UpdateBudgetCategoryRequest = req.body;

      log.info('📝 Updating budget category', {
        context: this.context,
        method: 'updateBudgetCategory',
        userId,
        budgetId,
        categoryId,
      });

      try {
        const category = await this.budgetService.updateBudgetCategory(
          budgetId,
          categoryId,
          userId,
          updates,
        );

        log.info('✅ Budget category updated successfully', {
          context: this.context,
          method: 'updateBudgetCategory',
          userId,
          budgetId,
          categoryId,
        });

        sendResponse({
          res,
          data: category,
          message: 'Budget category updated successfully',
        });
      } catch (error: any) {
        if (error.message === 'Budget not found' || error.message === 'Budget category not found') {
          log.warn('⚠️ Resource not found', {
            context: this.context,
            method: 'updateBudgetCategory',
            userId,
            budgetId,
            categoryId,
            error: error.message,
          });
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      log.error('💥 Error updating budget category', {
        context: this.context,
        method: 'updateBudgetCategory',
        error,
        userId: req.body.user?.userId,
        budgetId: req.params.budgetId,
        categoryId: req.params.categoryId,
      });
      res.status(500).json({ error: 'Failed to update budget category' });
    }
  };

  deleteBudgetCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      const { budgetId, categoryId } = req.params;

      log.info('🗑️ Deleting budget category', {
        context: this.context,
        method: 'deleteBudgetCategory',
        userId,
        budgetId,
        categoryId,
      });

      try {
        await this.budgetService.deleteBudgetCategory(budgetId, categoryId, userId);

        log.info('✅ Budget category deleted successfully', {
          context: this.context,
          method: 'deleteBudgetCategory',
          userId,
          budgetId,
          categoryId,
        });

        sendResponse({
          res,
          status: 204,
          data: null,
          message: 'Budget category deleted successfully',
        });
      } catch (error: any) {
        if (error.message === 'Budget not found' || error.message === 'Budget category not found') {
          log.warn('⚠️ Resource not found', {
            context: this.context,
            method: 'deleteBudgetCategory',
            userId,
            budgetId,
            categoryId,
            error: error.message,
          });
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      log.error('💥 Error deleting budget category', {
        context: this.context,
        method: 'deleteBudgetCategory',
        error,
        userId: req.body.user?.userId,
        budgetId: req.params.budgetId,
        categoryId: req.params.categoryId,
      });
      res.status(500).json({ error: 'Failed to delete budget category' });
    }
  };
}
