import { Request, Response } from 'express';

import { sendResponse } from '../common/utils';
import { TransactionService } from './service';
import {
  CreateCategoryRequest,
  CreateTransactionRequest,
  GetTransactionsQuery,
  UpdateCategoryRequest,
  UpdateTransactionRequest,
} from './types/interface';

export class TransactionController {
  private transactionService: TransactionService;

  constructor(transactionService: TransactionService) {
    this.transactionService = transactionService;
  }

  getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const query: GetTransactionsQuery = req.query as any;

      // Convert numeric query params
      if (query.minAmount) {
        query.minAmount = parseFloat(query.minAmount as any);
      }

      if (query.maxAmount) {
        query.maxAmount = parseFloat(query.maxAmount as any);
      }

      if (query.page) {
        query.page = parseInt(query.page as any, 10);
      }

      if (query.limit) {
        query.limit = parseInt(query.limit as any, 10);
      }

      const transactions = await this.transactionService.getTransactions(userId, query);
      sendResponse({ res, data: transactions, message: 'Transactions fetched successfully' });
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  };

  getTransactionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const { id } = req.params;

      const transaction = await this.transactionService.getTransactionById(id, userId);
      sendResponse({ res, data: transaction, message: 'Transaction fetched successfully' });
    } catch (error: any) {
      if (error.message === 'Transaction not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
      }
    }
  };

  createTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const transactionData: CreateTransactionRequest = req.body;

      // Basic validation
      if (
        !transactionData.date ||
        !transactionData.description ||
        transactionData.amount === undefined ||
        !transactionData.type ||
        !transactionData.categoryId ||
        !transactionData.accountId ||
        !transactionData.status
      ) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const transaction = await this.transactionService.createTransaction(userId, transactionData);
      sendResponse({
        res,
        data: transaction,
        message: 'Transaction created successfully',
        status: 201,
      });
    } catch (error: any) {
      if (error.message === 'Category not found') {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
      }
    }
  };

  updateTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const { id } = req.params;
      const updates: UpdateTransactionRequest = req.body;

      const transaction = await this.transactionService.updateTransaction(id, userId, updates);
      sendResponse({
        res,
        data: transaction,
        message: 'Transaction updated successfully',
      });
    } catch (error: any) {
      if (error.message === 'Transaction not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Category not found') {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Failed to update transaction' });
      }
    }
  };

  deleteTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const { id } = req.params;

      await this.transactionService.deleteTransaction(id, userId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Transaction not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Failed to delete transaction' });
      }
    }
  };

  uploadAttachment = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const { id } = req.params;

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const attachment = await this.transactionService.uploadAttachment(id, userId, req.file);
      sendResponse({
        res,
        data: attachment,
        message: 'Attachment uploaded successfully',
        status: 201,
      });
    } catch (error: any) {
      if (error.message === 'Transaction not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Error uploading attachment:', error);
        res.status(500).json({ error: 'Failed to upload attachment' });
      }
    }
  };

  getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      const { includeSubcategories } = req.query;
      delete req.body.user;

      const categories = await this.transactionService.getCategories(
        userId,
        includeSubcategories === 'true',
      );
      sendResponse({
        res,
        data: categories,
        message: 'Categories fetched successfully',
      });
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  };

  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const { name, color, icon, parentId }: CreateCategoryRequest = req.body;

      if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      const category = await this.transactionService.createCategory(
        userId,
        name,
        color,
        icon,
        parentId,
      );
      sendResponse({
        res,
        data: category,
        message: 'Category created successfully',
        status: 201,
      });
    } catch (error: any) {
      if (
        error.message === 'Category with this name already exists' ||
        error.message === 'Parent category not found'
      ) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
      }
    }
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const { id } = req.params;
      const { name, color, icon, parentId }: UpdateCategoryRequest = req.body;

      const category = await this.transactionService.updateCategory(
        id,
        userId,
        name,
        color,
        icon,
        parentId,
      );
      sendResponse({
        res,
        data: category,
        message: 'Category updated successfully',
      });
    } catch (error: any) {
      if (error.message === 'Category not found') {
        res.status(404).json({ error: error.message });
      } else if (
        error.message === 'Category with this name already exists' ||
        error.message === 'Parent category not found' ||
        error.message === 'Category cannot be its own parent'
      ) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
      }
    }
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user!.userId;
      delete req.body.user;
      const { id } = req.params;

      await this.transactionService.deleteCategory(id, userId);
      sendResponse({
        res,
        data: null,
        message: 'Category deleted successfully',
        status: 204,
      });
    } catch (error: any) {
      if (error.message === 'Category not found') {
        res.status(404).json({ error: error.message });
      } else if (
        error.message === 'Cannot delete category with associated transactions' ||
        error.message === 'Cannot delete category with child categories'
      ) {
        res.status(409).json({ error: error.message });
      } else {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
      }
    }
  };
}
