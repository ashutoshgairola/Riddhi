import dayjs from 'dayjs';
import fs from 'fs';
import { Db } from 'mongodb';
import path from 'path';
import { promisify } from 'util';

import { BudgetModel } from '../budgets/db';
import { AttachmentModel } from './attachment-db';
import { CategoryModel } from './category-db';
import { TransactionModel } from './db';
import {
  Attachment,
  AttachmentDTO,
  CategoryDTO,
  CreateTransactionRequest,
  GetTransactionsQuery,
  PaginationResponse,
  Transaction,
  TransactionCategory,
  TransactionDTO,
  TransactionsResponse,
  UpdateTransactionRequest,
} from './types/interface';

export class TransactionService {
  private transactionModel: TransactionModel;
  private categoryModel: CategoryModel;
  private attachmentModel: AttachmentModel;
  private budgetModel: BudgetModel;
  private uploadsDir: string;

  constructor(db: Db) {
    this.transactionModel = new TransactionModel(db);
    this.categoryModel = new CategoryModel(db);
    this.attachmentModel = new AttachmentModel(db);
    this.budgetModel = new BudgetModel(db);
    this.uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async initialize(): Promise<void> {
    await this.transactionModel.initialize();
    await this.categoryModel.initialize();
    await this.attachmentModel.initialize();
    await this.budgetModel.initialize();
  }

  async getTransactions(
    userId: string,
    query: GetTransactionsQuery,
  ): Promise<PaginationResponse<TransactionDTO>> {
    const data = await this.transactionModel.findAll(userId, query);
    const transactionDTOs = await Promise.all(
      data.items.map((t) => this.enrichTransactionWithCategory(t)),
    );

    return {
      ...data,
      items: transactionDTOs,
    };
  }

  async getTransactionById(id: string, userId: string): Promise<TransactionDTO> {
    const transaction = await this.transactionModel.findById(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return this.enrichTransactionWithCategory(transaction);
  }

  async createTransaction(
    userId: string,
    transactionData: CreateTransactionRequest,
  ): Promise<TransactionDTO> {
    const category = await this.categoryModel.findById(transactionData.categoryId, userId);
    if (!category) {
      throw new Error('Category not found');
    }

    const date = new Date(transactionData.date);

    let transaction: Transaction = {
      userId,
      date,
      description: transactionData.description,
      amount: transactionData.amount,
      type: transactionData.type,
      categoryId: transactionData.categoryId,
      accountId: transactionData.accountId,
      notes: transactionData.notes,
      status: transactionData.status,
      tags: transactionData.tags,
      isRecurring: transactionData.isRecurring || false,
      createdAt: dayjs().toDate(),
      updatedAt: dayjs().toDate(),
    };

    if (transactionData.isRecurring && transactionData.recurringDetails) {
      const recurringId = dayjs().valueOf().toString();
      transaction.recurringId = recurringId;
    }
    const createdTransaction = await this.transactionModel.create(transaction);

    // Update budget if transaction is an expense
    if (createdTransaction.type === 'expense') {
      await this.updateBudgetForTransaction(createdTransaction, 'create');
    }

    return this.mapTransactionToDTO(createdTransaction);
  }

  async updateTransaction(
    id: string,
    userId: string,
    updates: UpdateTransactionRequest,
  ): Promise<TransactionDTO> {
    const existingTransaction = await this.transactionModel.findById(id, userId);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    // Store the original transaction for budget comparison
    const originalTransaction = { ...existingTransaction };

    const transactionUpdates: Partial<Transaction> = {};

    if (updates.date) {
      transactionUpdates.date = new Date(updates.date);
    }

    if (updates.description !== undefined) {
      transactionUpdates.description = updates.description;
    }

    if (updates.amount !== undefined) {
      transactionUpdates.amount = updates.amount;
    }

    if (updates.type !== undefined) {
      transactionUpdates.type = updates.type;
    }

    if (updates.categoryId !== undefined) {
      const category = await this.categoryModel.findById(updates.categoryId, userId);
      if (!category) {
        throw new Error('Category not found');
      }
      transactionUpdates.categoryId = updates.categoryId;
    }

    if (updates.accountId !== undefined) {
      transactionUpdates.accountId = updates.accountId;
    }

    if (updates.notes !== undefined) {
      transactionUpdates.notes = updates.notes;
    }

    if (updates.status !== undefined) {
      transactionUpdates.status = updates.status;
    }

    if (updates.tags !== undefined) {
      transactionUpdates.tags = updates.tags;
    }

    if (updates.isRecurring !== undefined) {
      transactionUpdates.isRecurring = updates.isRecurring;
    }

    const updatedTransaction = await this.transactionModel.update(id, userId, transactionUpdates);

    if (!updatedTransaction) {
      throw new Error('Failed to update transaction');
    }

    // Update budget based on changes
    await this.updateBudgetForTransaction(updatedTransaction, 'update', originalTransaction);

    return this.mapTransactionToDTO(updatedTransaction);
  }

  async deleteTransaction(id: string, userId: string): Promise<void> {
    const transaction = await this.transactionModel.findById(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update budget if transaction is an expense
    if (transaction.type === 'expense') {
      await this.updateBudgetForTransaction(transaction, 'delete');
    }

    const deleted = await this.transactionModel.delete(id, userId);

    if (!deleted) {
      throw new Error('Failed to delete transaction');
    }

    if (transaction.attachments && transaction.attachments.length > 0) {
      for (const attachment of transaction.attachments) {
        await this.deleteAttachment(attachment._id!.toString());
      }
    }
  }

  private async updateBudgetForTransaction(
    transaction: Transaction,
    operation: 'create' | 'update' | 'delete',
    originalTransaction?: Transaction,
  ): Promise<void> {
    // Find all budgets that contain this transaction date
    const budgets = await this.budgetModel.findByDateRange(
      transaction.userId,
      transaction.date,
      transaction.date,
    );

    for (const budget of budgets) {
      if (operation === 'create') {
        // Add the transaction amount to the budget
        await this.budgetModel.adjustCategorySpent(
          budget._id!.toString(),
          transaction.userId,
          transaction.categoryId,
          transaction.amount,
        );
      } else if (operation === 'delete') {
        // Subtract the transaction amount from the budget
        await this.budgetModel.adjustCategorySpent(
          budget._id!.toString(),
          transaction.userId,
          transaction.categoryId,
          -transaction.amount,
        );
      } else if (operation === 'update' && originalTransaction) {
        // Handle updates to transactions
        const dateChanged = originalTransaction.date.getTime() !== transaction.date.getTime();
        const categoryChanged = originalTransaction.categoryId !== transaction.categoryId;
        const amountChanged = originalTransaction.amount !== transaction.amount;
        const typeChanged = originalTransaction.type !== transaction.type;

        if (dateChanged) {
          // Transaction moved to a different date, might affect different budgets

          // First, check if original transaction was in a budget period
          const originalBudgets = await this.budgetModel.findByDateRange(
            transaction.userId,
            originalTransaction.date,
            originalTransaction.date,
          );

          // Remove from original budget if it existed
          for (const oldBudget of originalBudgets) {
            if (originalTransaction.type === 'expense') {
              await this.budgetModel.adjustCategorySpent(
                oldBudget._id!.toString(),
                transaction.userId,
                originalTransaction.categoryId,
                -originalTransaction.amount,
              );
            }
          }

          // Check if new transaction date is in a budget period
          const newBudgets = await this.budgetModel.findByDateRange(
            transaction.userId,
            transaction.date,
            transaction.date,
          );

          // Add to new budget if it exists
          for (const newBudget of newBudgets) {
            if (transaction.type === 'expense') {
              await this.budgetModel.adjustCategorySpent(
                newBudget._id!.toString(),
                transaction.userId,
                transaction.categoryId,
                transaction.amount,
              );
            }
          }
        } else {
          // Date didn't change, handle other changes within the same budget period

          if (typeChanged) {
            if (originalTransaction.type === 'expense' && transaction.type !== 'expense') {
              // Changed from expense to non-expense, remove from budget
              await this.budgetModel.adjustCategorySpent(
                budget._id!.toString(),
                transaction.userId,
                originalTransaction.categoryId,
                -originalTransaction.amount,
              );
            } else if (originalTransaction.type !== 'expense' && transaction.type === 'expense') {
              // Changed from non-expense to expense, add to budget
              await this.budgetModel.adjustCategorySpent(
                budget._id!.toString(),
                transaction.userId,
                transaction.categoryId,
                transaction.amount,
              );
            }
          } else if (transaction.type === 'expense') {
            // Still an expense, handle category or amount changes

            if (categoryChanged && !amountChanged) {
              // Category changed, move amount from old to new category
              await this.budgetModel.adjustCategorySpent(
                budget._id!.toString(),
                transaction.userId,
                originalTransaction.categoryId,
                -originalTransaction.amount,
              );
              await this.budgetModel.adjustCategorySpent(
                budget._id!.toString(),
                transaction.userId,
                transaction.categoryId,
                transaction.amount,
              );
            } else if (!categoryChanged && amountChanged) {
              // Amount changed, adjust the difference
              const difference = transaction.amount - originalTransaction.amount;
              await this.budgetModel.adjustCategorySpent(
                budget._id!.toString(),
                transaction.userId,
                transaction.categoryId,
                difference,
              );
            } else if (categoryChanged && amountChanged) {
              // Both changed, remove from old and add to new
              await this.budgetModel.adjustCategorySpent(
                budget._id!.toString(),
                transaction.userId,
                originalTransaction.categoryId,
                -originalTransaction.amount,
              );
              await this.budgetModel.adjustCategorySpent(
                budget._id!.toString(),
                transaction.userId,
                transaction.categoryId,
                transaction.amount,
              );
            }
          }
        }
      }
    }
  }

  async uploadAttachment(
    transactionId: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<AttachmentDTO> {
    const transaction = await this.transactionModel.findById(transactionId, userId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadsDir, fileName);

    const writeFile = promisify(fs.writeFile);
    await writeFile(filePath, file.buffer);

    const attachment: Attachment = {
      fileName: file.originalname,
      fileType: file.mimetype,
      url: `/uploads/${fileName}`,
      uploadedAt: dayjs().toDate(),
    };

    if (file.mimetype.startsWith('image/')) {
      attachment.thumbnailUrl = `/uploads/thumbnails/${fileName}`;
    }

    const createdAttachment = await this.attachmentModel.create(attachment);

    const attachments = transaction.attachments || [];
    attachments.push(createdAttachment);

    await this.transactionModel.update(transactionId, userId, { attachments });

    return this.mapAttachmentToDTO(createdAttachment);
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    const attachment = await this.attachmentModel.findById(attachmentId);
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    const filePath = path.join(process.cwd(), attachment.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (attachment.thumbnailUrl) {
      const thumbnailPath = path.join(process.cwd(), attachment.thumbnailUrl);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    await this.attachmentModel.delete(attachmentId);
  }

  async getCategories(userId: string, includeSubcategories: boolean): Promise<CategoryDTO[]> {
    const categories = await this.categoryModel.findAll(userId);

    if (includeSubcategories) {
      for (const category of categories) {
        const subcategories = await this.categoryModel.findByParentId(
          category._id!.toString(),
          userId,
        );
        category.subcategories = subcategories.map((subcategory) => ({
          ...subcategory,
          userId: subcategory.userId,
          createdAt: subcategory.createdAt,
          updatedAt: subcategory.updatedAt,
        }));
      }
    }
    return categories.map(this.mapCategoryToDTO);
  }

  async createCategory(
    userId: string,
    name: string,
    color?: string,
    icon?: string,
    parentId?: string,
  ): Promise<CategoryDTO> {
    const existingCategory = await this.categoryModel.findByName(name, userId);
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    if (parentId) {
      const parentCategory = await this.categoryModel.findById(parentId, userId);
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
    }

    const category: Omit<TransactionCategory, '_id' | 'createdAt' | 'updatedAt'> = {
      userId,
      name,
      color,
      icon,
      parentId,
    };

    const createdCategory = await this.categoryModel.create(category);
    return this.mapCategoryToDTO(createdCategory);
  }

  async updateCategory(
    id: string,
    userId: string,
    name?: string,
    color?: string,
    icon?: string,
    parentId?: string,
  ): Promise<CategoryDTO> {
    const existingCategory = await this.categoryModel.findById(id, userId);
    if (!existingCategory) {
      throw new Error('Category not found');
    }

    if (name && name !== existingCategory.name) {
      const categoryWithSameName = await this.categoryModel.findByName(name, userId);
      if (categoryWithSameName) {
        throw new Error('Category with this name already exists');
      }
    }

    if (parentId) {
      if (parentId === id) {
        throw new Error('Category cannot be its own parent');
      }

      const parentCategory = await this.categoryModel.findById(parentId, userId);
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
    }

    const updates: Partial<TransactionCategory> = {};

    if (name !== undefined) {
      updates.name = name;
    }

    if (color !== undefined) {
      updates.color = color;
    }

    if (icon !== undefined) {
      updates.icon = icon;
    }

    if (parentId !== undefined) {
      updates.parentId = parentId;
    }

    const updatedCategory = await this.categoryModel.update(id, userId, updates);

    if (!updatedCategory) {
      throw new Error('Failed to update category');
    }

    return this.mapCategoryToDTO(updatedCategory);
  }

  async deleteCategory(id: string, userId: string): Promise<void> {
    const category = await this.categoryModel.findById(id, userId);
    if (!category) {
      throw new Error('Category not found');
    }

    const transactionCount = await this.transactionModel.countByCategory(userId, id);
    if (transactionCount > 0) {
      throw new Error('Cannot delete category with associated transactions');
    }

    const childCategories = await this.categoryModel.findByParentId(id, userId);
    if (childCategories.length > 0) {
      throw new Error('Cannot delete category with child categories');
    }

    const deleted = await this.categoryModel.delete(id, userId);

    if (!deleted) {
      throw new Error('Failed to delete category');
    }
  }

  private async enrichTransactionWithCategory(transaction: Transaction): Promise<TransactionDTO> {
    const dto = this.mapTransactionToDTO(transaction);

    try {
      const category = await this.categoryModel.findById(
        transaction.categoryId,
        transaction.userId,
      );
      if (category) {
        dto.category = this.mapCategoryToDTO(category);
      }
    } catch (error) {
      console.error(`Error fetching category for transaction ${transaction._id}:`, error);
    }

    return dto;
  }

  private mapTransactionToDTO(transaction: Transaction): TransactionDTO {
    return {
      id: transaction._id!.toString(),
      date: transaction.date.toISOString(),
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId,
      notes: transaction.notes,
      status: transaction.status,
      tags: transaction.tags,
      attachments: transaction.attachments?.map(this.mapAttachmentToDTO),
      isRecurring: transaction.isRecurring,
      recurringId: transaction.recurringId,
    };
  }

  private mapCategoryToDTO(category: TransactionCategory): CategoryDTO {
    return {
      id: category._id!.toString(),
      name: category.name,
      color: category.color,
      icon: category.icon,
      parentId: category.parentId,
    };
  }

  private mapAttachmentToDTO(attachment: Attachment): AttachmentDTO {
    return {
      id: attachment._id!.toString(),
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      url: attachment.url,
      thumbnailUrl: attachment.thumbnailUrl,
      uploadedAt: attachment.uploadedAt.toISOString(),
    };
  }
}
