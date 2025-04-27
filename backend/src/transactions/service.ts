import { Db } from "mongodb";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import {
  Transaction,
  TransactionDTO,
  TransactionCategory,
  CategoryDTO,
  Attachment,
  AttachmentDTO,
  GetTransactionsQuery,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionsResponse,
  CategoriesResponse,
} from "./types/interface";
import { TransactionModel } from "./db";
import { CategoryModel } from "./category-db";
import { AttachmentModel } from "./attachment-db";
import dayjs from "dayjs";

export class TransactionService {
  private transactionModel: TransactionModel;
  private categoryModel: CategoryModel;
  private attachmentModel: AttachmentModel;
  private uploadsDir: string;

  constructor(db: Db) {
    this.transactionModel = new TransactionModel(db);
    this.categoryModel = new CategoryModel(db);
    this.attachmentModel = new AttachmentModel(db);
    this.uploadsDir =
      process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");

    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async initialize(): Promise<void> {
    await this.transactionModel.initialize();
    await this.categoryModel.initialize();
    await this.attachmentModel.initialize();
  }

  async getTransactions(
    userId: string,
    query: GetTransactionsQuery
  ): Promise<TransactionsResponse> {
    const { transactions, pagination } = await this.transactionModel.findAll(
      userId,
      query
    );
    const transactionDTOs = await Promise.all(
      transactions.map((t) => this.enrichTransactionWithCategory(t))
    );

    return {
      data: transactionDTOs,
      pagination,
    };
  }

  async getTransactionById(
    id: string,
    userId: string
  ): Promise<TransactionDTO> {
    const transaction = await this.transactionModel.findById(id, userId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return this.enrichTransactionWithCategory(transaction);
  }

  async createTransaction(
    userId: string,
    transactionData: CreateTransactionRequest
  ): Promise<TransactionDTO> {
    // Validate category exists
    const category = await this.categoryModel.findById(
      transactionData.categoryId,
      userId
    );
    if (!category) {
      throw new Error("Category not found");
    }

    // Parse date
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

    // Handle recurring transactions
    if (transactionData.isRecurring && transactionData.recurringDetails) {
      // Generate a recurring ID for all related transactions
      const recurringId = dayjs().valueOf().toString();
      transaction.recurringId = recurringId;

      // Store original transaction
      const createdTransaction = await this.transactionModel.create(
        transaction
      );

      // TODO: Implement logic to generate future recurring transactions
      // This would typically involve a scheduled job or separate service

      return this.mapTransactionToDTO(createdTransaction);
    } else {
      // Store non-recurring transaction
      const createdTransaction = await this.transactionModel.create(
        transaction
      );
      return this.mapTransactionToDTO(createdTransaction);
    }
  }

  async updateTransaction(
    id: string,
    userId: string,
    updates: UpdateTransactionRequest
  ): Promise<TransactionDTO> {
    // Validate transaction exists
    const existingTransaction = await this.transactionModel.findById(
      id,
      userId
    );
    if (!existingTransaction) {
      throw new Error("Transaction not found");
    }

    // Prepare updates
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
      // Validate category exists
      const category = await this.categoryModel.findById(
        updates.categoryId,
        userId
      );
      if (!category) {
        throw new Error("Category not found");
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

    // Apply updates
    const updatedTransaction = await this.transactionModel.update(
      id,
      userId,
      transactionUpdates
    );

    if (!updatedTransaction) {
      throw new Error("Failed to update transaction");
    }

    return this.mapTransactionToDTO(updatedTransaction);
  }

  async deleteTransaction(id: string, userId: string): Promise<void> {
    // Validate transaction exists
    const transaction = await this.transactionModel.findById(id, userId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Delete transaction
    const deleted = await this.transactionModel.delete(id, userId);

    if (!deleted) {
      throw new Error("Failed to delete transaction");
    }

    // If transaction has attachments, delete them as well
    if (transaction.attachments && transaction.attachments.length > 0) {
      for (const attachment of transaction.attachments) {
        await this.deleteAttachment(attachment._id!.toString());
      }
    }
  }

  async uploadAttachment(
    transactionId: string,
    userId: string,
    file: Express.Multer.File
  ): Promise<AttachmentDTO> {
    // Validate transaction exists
    const transaction = await this.transactionModel.findById(
      transactionId,
      userId
    );
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Create file path and URL
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadsDir, fileName);

    // Move uploaded file
    const writeFile = promisify(fs.writeFile);
    await writeFile(filePath, file.buffer);

    // Create attachment record
    const attachment: Attachment = {
      fileName: file.originalname,
      fileType: file.mimetype,
      url: `/uploads/${fileName}`,
      uploadedAt: dayjs().toDate(),
    };

    if (file.mimetype.startsWith("image/")) {
      // TODO: Generate thumbnail for images
      attachment.thumbnailUrl = `/uploads/thumbnails/${fileName}`;
    }

    const createdAttachment = await this.attachmentModel.create(attachment);

    // Add attachment to transaction
    const attachments = transaction.attachments || [];
    attachments.push(createdAttachment);

    await this.transactionModel.update(transactionId, userId, { attachments });

    return this.mapAttachmentToDTO(createdAttachment);
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    const attachment = await this.attachmentModel.findById(attachmentId);
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), attachment.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete thumbnail if exists
    if (attachment.thumbnailUrl) {
      const thumbnailPath = path.join(process.cwd(), attachment.thumbnailUrl);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    // Delete from database
    await this.attachmentModel.delete(attachmentId);
  }

  async getCategories(userId: string): Promise<CategoriesResponse> {
    const categories = await this.categoryModel.findAll(userId);
    return {
      data: categories.map(this.mapCategoryToDTO),
    };
  }

  async createCategory(
    userId: string,
    name: string,
    color?: string,
    icon?: string,
    parentId?: string
  ): Promise<CategoryDTO> {
    // Check if category with same name already exists
    const existingCategory = await this.categoryModel.findByName(name, userId);
    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }

    // Validate parent category if provided
    if (parentId) {
      const parentCategory = await this.categoryModel.findById(
        parentId,
        userId
      );
      if (!parentCategory) {
        throw new Error("Parent category not found");
      }
    }

    const category: Omit<
      TransactionCategory,
      "_id" | "createdAt" | "updatedAt"
    > = {
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
    parentId?: string
  ): Promise<CategoryDTO> {
    // Validate category exists
    const existingCategory = await this.categoryModel.findById(id, userId);
    if (!existingCategory) {
      throw new Error("Category not found");
    }

    // Validate name uniqueness if changing name
    if (name && name !== existingCategory.name) {
      const categoryWithSameName = await this.categoryModel.findByName(
        name,
        userId
      );
      if (categoryWithSameName) {
        throw new Error("Category with this name already exists");
      }
    }

    // Validate parent category if provided
    if (parentId) {
      // Prevent circular parent references
      if (parentId === id) {
        throw new Error("Category cannot be its own parent");
      }

      const parentCategory = await this.categoryModel.findById(
        parentId,
        userId
      );
      if (!parentCategory) {
        throw new Error("Parent category not found");
      }

      // TODO: More complex validation to prevent deeper circular references
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

    const updatedCategory = await this.categoryModel.update(
      id,
      userId,
      updates
    );

    if (!updatedCategory) {
      throw new Error("Failed to update category");
    }

    return this.mapCategoryToDTO(updatedCategory);
  }

  async deleteCategory(id: string, userId: string): Promise<void> {
    // Validate category exists
    const category = await this.categoryModel.findById(id, userId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check if category has transactions
    const transactionCount = await this.transactionModel.countByCategory(
      userId,
      id
    );
    if (transactionCount > 0) {
      throw new Error("Cannot delete category with associated transactions");
    }

    // Check if category has child categories
    const childCategories = await this.categoryModel.findByParentId(id, userId);
    if (childCategories.length > 0) {
      throw new Error("Cannot delete category with child categories");
    }

    // Delete category
    const deleted = await this.categoryModel.delete(id, userId);

    if (!deleted) {
      throw new Error("Failed to delete category");
    }
  }

  private async enrichTransactionWithCategory(
    transaction: Transaction
  ): Promise<TransactionDTO> {
    const dto = this.mapTransactionToDTO(transaction);

    try {
      const category = await this.categoryModel.findById(
        transaction.categoryId,
        transaction.userId
      );
      if (category) {
        dto.category = this.mapCategoryToDTO(category);
      }
    } catch (error) {
      // Simply leave category as undefined if there's an error
      console.error(
        `Error fetching category for transaction ${transaction._id}:`,
        error
      );
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
