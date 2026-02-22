import crypto from 'crypto';
import fs from 'fs';
import { Db } from 'mongodb';
import path from 'path';

import { AccountModel } from '../accounts/db';
import { AccountType } from '../accounts/types/interface';
import { BudgetModel } from '../budgets/db';
import { createChildLogger } from '../config/logger';
import { GoalModel } from '../goals/db';
import { TransactionModel } from '../transactions/db';
import { AccountConnectionModel } from './account-connection-db';
import { NotificationSettingModel } from './notification-settings-db';
import {
  AccountConnection,
  AccountConnectionDTO,
  AccountConnectionsResponse,
  ClearDataRequest,
  ConnectAccountRequest,
  ExportDataQuery,
  ImportStats,
  NotificationSetting,
  NotificationSettingDTO,
  NotificationSettingsResponse,
  UpdateNotificationSettingRequest,
  UpdateUserPreferencesRequest,
  UserPreferences,
  UserPreferencesDTO,
} from './types/interface';
import { UserPreferencesModel } from './user-preference-db';

export class SettingsService {
  private userPreferencesModel: UserPreferencesModel;
  private notificationSettingModel: NotificationSettingModel;
  private accountConnectionModel: AccountConnectionModel;
  private transactionModel: TransactionModel;
  private budgetModel: BudgetModel;
  private goalModel: GoalModel;
  private accountModel: AccountModel;
  private exportsDir: string;
  private logger = createChildLogger({ service: 'SettingsService' });

  constructor(db: Db) {
    this.userPreferencesModel = new UserPreferencesModel(db);
    this.notificationSettingModel = new NotificationSettingModel(db);
    this.accountConnectionModel = new AccountConnectionModel(db);
    this.transactionModel = new TransactionModel(db);
    this.budgetModel = new BudgetModel(db);
    this.goalModel = new GoalModel(db);
    this.accountModel = new AccountModel(db);

    // Create exports directory
    this.exportsDir = process.env.EXPORTS_DIR || path.join(process.cwd(), 'exports');
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  async initialize(): Promise<void> {
    await this.userPreferencesModel.initialize();
    await this.notificationSettingModel.initialize();
    await this.accountConnectionModel.initialize();
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferencesDTO> {
    let preferences = await this.userPreferencesModel.findByUserId(userId);

    if (!preferences) {
      // Create default preferences if none exist
      preferences = await this.userPreferencesModel.createOrUpdate(userId, {});
    }

    return this.mapUserPreferencesToDTO(preferences);
  }

  async updateUserPreferences(
    userId: string,
    updates: UpdateUserPreferencesRequest,
  ): Promise<UserPreferencesDTO> {
    const updatedPreferences = await this.userPreferencesModel.createOrUpdate(userId, updates);
    return this.mapUserPreferencesToDTO(updatedPreferences);
  }

  // Notification Settings
  async getNotificationSettings(userId: string): Promise<NotificationSettingsResponse> {
    let settings = await this.notificationSettingModel.findByUserId(userId);

    if (settings.length === 0) {
      // Create default notification settings if none exist
      settings = await this.notificationSettingModel.createDefaultSettings(userId);
    }

    return {
      data: settings.map(this.mapNotificationSettingToDTO),
    };
  }

  async updateNotificationSetting(
    id: string,
    userId: string,
    updates: UpdateNotificationSettingRequest,
  ): Promise<NotificationSettingDTO> {
    const setting = await this.notificationSettingModel.findById(id, userId);

    if (!setting) {
      throw new Error('Notification setting not found');
    }

    const updatedSetting = await this.notificationSettingModel.update(id, userId, updates);

    if (!updatedSetting) {
      throw new Error('Failed to update notification setting');
    }

    return this.mapNotificationSettingToDTO(updatedSetting);
  }

  // Account Connections
  async getAccountConnections(userId: string): Promise<AccountConnectionsResponse> {
    const connections = await this.accountConnectionModel.findByUserId(userId);

    return {
      data: connections.map(this.mapAccountConnectionToDTO),
    };
  }

  async connectAccount(
    userId: string,
    connectionData: ConnectAccountRequest,
  ): Promise<AccountConnectionDTO> {
    // This would typically integrate with a third-party banking API
    // For now, we'll implement a mock version

    // Encrypt credentials (in a real app, use proper encryption)
    const encryptedCredentials = this.encryptCredentials(connectionData.credentials);

    // Mock connection to institution API
    // In a real implementation, this would call the actual banking API
    const connectionDetails = await this.mockInstitutionConnection(connectionData);

    // Create connection record
    const newConnection: Omit<AccountConnection, '_id' | 'createdAt' | 'updatedAt'> = {
      userId,
      name: connectionDetails.name,
      type: connectionDetails.type,
      institutionId: connectionData.institutionId,
      institutionName: connectionDetails.institutionName,
      institutionLogo: connectionDetails.institutionLogo,
      isConnected: true,
      lastUpdated: new Date(),
      accounts: connectionDetails.accounts,
      credentials: {
        encrypted: encryptedCredentials,
      },
    };

    const createdConnection = await this.accountConnectionModel.create(newConnection);

    // Create actual account records for each account
    for (const account of connectionDetails.accounts) {
      await this.accountModel.create({
        userId,
        name: account.name,
        type: account.type as AccountType,
        balance: account.balance,
        currency: 'USD', // Default for mock
        institutionName: connectionDetails.institutionName,
        institutionLogo: connectionDetails.institutionLogo,
        lastUpdated: new Date(),
        isConnected: true,
        connectionId: createdConnection._id?.toString() ?? '',
        includeInNetWorth: true,
      });
    }

    return this.mapAccountConnectionToDTO(createdConnection);
  }

  async refreshConnection(id: string, userId: string): Promise<AccountConnectionDTO> {
    const connection = await this.accountConnectionModel.findById(id, userId);

    if (!connection) {
      throw new Error('Connection not found');
    }

    if (!connection.isConnected) {
      throw new Error('Connection is not active');
    }

    // In a real implementation, this would call the banking API to refresh data
    // Here we'll just update the lastUpdated timestamp
    const updatedConnection = await this.accountConnectionModel.update(id, userId, {
      lastUpdated: new Date(),
    });

    if (!updatedConnection) {
      throw new Error('Failed to refresh connection');
    }

    return this.mapAccountConnectionToDTO(updatedConnection);
  }

  async disconnectAccount(id: string, userId: string): Promise<void> {
    const connection = await this.accountConnectionModel.findById(id, userId);

    if (!connection) {
      throw new Error('Connection not found');
    }

    // Mark accounts as disconnected
    for (const account of connection.accounts) {
      await this.accountModel.update(account.id, userId, {
        isConnected: false,
      });
    }

    // Delete the connection
    const deleted = await this.accountConnectionModel.delete(id, userId);

    if (!deleted) {
      throw new Error('Failed to disconnect account');
    }
  }

  // Data Management
  async exportData(
    userId: string,
    query: ExportDataQuery,
  ): Promise<{ filePath: string; contentType: string }> {
    const { format, type = 'all' } = query;

    // Determine which data to export
    const data: Record<string, unknown[]> = {};

    if (type === 'all' || type === 'transactions') {
      const transactionsResult = await this.transactionModel.findAll(userId, {});
      data.transactions = transactionsResult.items;
    }

    if (type === 'all' || type === 'budgets') {
      const budgetsResult = await this.budgetModel.findAll(userId, {});
      data.budgets = budgetsResult.items;
    }

    if (type === 'all' || type === 'goals') {
      const { goals } = await this.goalModel.findAll(userId, {});
      data.goals = goals;
    }

    if (type === 'all' || type === 'accounts') {
      const accounts = await this.accountModel.findAll(userId);
      data.accounts = accounts;
    }

    // Format the data
    let formattedData: string;
    let contentType: string;

    if (format === 'json') {
      formattedData = JSON.stringify(data, null, 2);
      contentType = 'application/json';
    } else if (format === 'csv') {
      // Simple CSV conversion - in a real app, use a proper CSV library
      formattedData = this.convertToCSV(data, type);
      contentType = 'text/csv';
    } else {
      throw new Error('Invalid format');
    }

    // Save to file
    const fileName = `export-${userId}-${type}-${Date.now()}.${format}`;
    const filePath = path.join(this.exportsDir, fileName);

    fs.writeFileSync(filePath, formattedData);

    return { filePath, contentType };
  }

  async importData(userId: string, file: Express.Multer.File, type: string): Promise<ImportStats> {
    // Validate file type
    const fileExt = path.extname(file.originalname).toLowerCase();
    const isJSON = fileExt === '.json' && file.mimetype.includes('json');
    const isCSV =
      fileExt === '.csv' && (file.mimetype.includes('csv') || file.mimetype.includes('text/plain'));

    if (!isJSON && !isCSV) {
      throw new Error('Invalid file format. Only JSON and CSV are supported.');
    }

    // Parse file content
    let data: Record<string, unknown>[];

    if (isJSON) {
      try {
        const content = file.buffer.toString('utf8');
        const parsedData = JSON.parse(content);
        data = Array.isArray(parsedData) ? parsedData : parsedData[type] || [];
      } catch (error) {
        throw new Error('Invalid JSON format');
      }
    } else {
      // CSV parsing - in a real app, use a proper CSV parser library
      try {
        const content = file.buffer.toString('utf8');
        data = this.parseCSV(content, type);
      } catch (error) {
        throw new Error('Invalid CSV format');
      }
    }

    // Process and import data based on type
    const stats: ImportStats = {
      imported: 0,
      skipped: 0,
      errors: 0,
    };

    switch (type) {
      case 'transactions':
        await this.importTransactions(userId, data, stats);
        break;

      case 'budgets':
        await this.importBudgets(userId, data, stats);
        break;

      case 'goals':
        await this.importGoals(userId, data, stats);
        break;

      default:
        throw new Error(`Unsupported import type: ${type}`);
    }

    return stats;
  }

  async clearData(userId: string, request: ClearDataRequest): Promise<void> {
    const { types, confirmation } = request;

    // Validate confirmation
    if (confirmation !== 'DELETE MY DATA') {
      throw new Error('Invalid confirmation text');
    }

    // Process each data type
    const clearPromises = types.map((type) => {
      switch (type) {
        case 'transactions':
          return this.clearUserTransactions(userId);

        case 'budgets':
          return this.clearUserBudgets(userId);

        case 'goals':
          return this.clearUserGoals(userId);

        case 'accounts':
          return this.clearUserAccounts(userId);

        default:
          throw new Error(`Unsupported data type: ${type}`);
      }
    });

    await Promise.all(clearPromises);
  }

  // Private helper methods
  private mapUserPreferencesToDTO(preferences: UserPreferences): UserPreferencesDTO {
    return {
      currency: preferences.currency,
      dateFormat: preferences.dateFormat,
      theme: preferences.theme,
      startOfWeek: preferences.startOfWeek,
      language: preferences.language,
    };
  }

  private mapNotificationSettingToDTO(setting: NotificationSetting): NotificationSettingDTO {
    return {
      id: setting._id?.toString() ?? '',
      name: setting.name,
      description: setting.description,
      email: setting.email,
      push: setting.push,
      sms: setting.sms,
    };
  }

  private mapAccountConnectionToDTO(connection: AccountConnection): AccountConnectionDTO {
    return {
      id: connection._id?.toString() ?? '',
      name: connection.name,
      type: connection.type,
      institutionName: connection.institutionName,
      institutionLogo: connection.institutionLogo,
      isConnected: connection.isConnected,
      lastUpdated: connection.lastUpdated.toISOString(),
      accounts: connection.accounts,
    };
  }

  private encryptCredentials(credentials: Record<string, unknown>): string {
    // In a real app, use a proper encryption library
    // This is just a simplistic example
    const secret = process.env.ENCRYPTION_KEY || 'default-secret-key';
    const cipher = crypto.createCipher('aes-256-cbc', secret);

    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }

  private async mockInstitutionConnection(connectionData: ConnectAccountRequest): Promise<{
    name: string;
    type: string;
    institutionName: string;
    institutionLogo?: string;
    accounts: {
      id: string;
      name: string;
      type: string;
      balance: number;
    }[];
  }> {
    // Simulate institution connection
    // In a real app, this would call the banking API

    // Mock data based on institution ID
    const mockInstitutions: Record<
      string,
      {
        name: string;
        type: string;
        institutionName: string;
        institutionLogo?: string;
        accounts: { id: string; name: string; type: string; balance: number }[];
      }
    > = {
      chase: {
        name: 'Chase Bank Connection',
        type: 'bank',
        institutionName: 'Chase Bank',
        institutionLogo: 'https://example.com/chase-logo.png',
        accounts: [
          {
            id: crypto.randomUUID(),
            name: 'Chase Checking',
            type: 'checking',
            balance: 2580.42,
          },
          {
            id: crypto.randomUUID(),
            name: 'Chase Savings',
            type: 'savings',
            balance: 15750.65,
          },
          {
            id: crypto.randomUUID(),
            name: 'Chase Credit Card',
            type: 'credit',
            balance: -1250.3,
          },
        ],
      },
      bofa: {
        name: 'Bank of America Connection',
        type: 'bank',
        institutionName: 'Bank of America',
        institutionLogo: 'https://example.com/bofa-logo.png',
        accounts: [
          {
            id: crypto.randomUUID(),
            name: 'BofA Checking',
            type: 'checking',
            balance: 3420.18,
          },
          {
            id: crypto.randomUUID(),
            name: 'BofA Savings',
            type: 'savings',
            balance: 8975.32,
          },
        ],
      },
      vanguard: {
        name: 'Vanguard Investment Connection',
        type: 'investment',
        institutionName: 'Vanguard',
        institutionLogo: 'https://example.com/vanguard-logo.png',
        accounts: [
          {
            id: crypto.randomUUID(),
            name: 'Vanguard 401(k)',
            type: 'investment',
            balance: 125750.82,
          },
          {
            id: crypto.randomUUID(),
            name: 'Vanguard IRA',
            type: 'investment',
            balance: 42680.17,
          },
        ],
      },
    };

    // Get mock data or create generic one
    const mockData = mockInstitutions[connectionData.institutionId] || {
      name: `${connectionData.institutionId} Connection`,
      type: 'bank',
      institutionName:
        connectionData.institutionId.charAt(0).toUpperCase() +
        connectionData.institutionId.slice(1),
      accounts: [
        {
          id: crypto.randomUUID(),
          name: `${connectionData.institutionId} Checking`,
          type: 'checking',
          balance: 1000 + Math.random() * 5000,
        },
      ],
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return mockData;
  }

  private convertToCSV(data: Record<string, unknown[]>, type: string): string {
    // Simple CSV conversion - in a real app, use a proper CSV library
    let csv = '';
    const items = data[type] || [];

    if (items.length === 0) {
      return '';
    }

    // Get headers from first item keys
    const firstItem = items[0] as Record<string, unknown>;
    const headers = Object.keys(firstItem).filter(
      (key) => !Array.isArray(firstItem[key]) && typeof firstItem[key] !== 'object',
    );

    // Add headers row
    csv += headers.join(',') + '\n';

    // Add data rows
    items.forEach((item: unknown) => {
      const record = item as Record<string, unknown>;
      const row = headers.map((header) => {
        const value = record[header];

        // Format value for CSV
        if (value === null || value === undefined) {
          return '';
        } else if (value instanceof Date) {
          return value.toISOString();
        } else if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if contains comma
          const escaped = value.replace(/"/g, '""');
          return value.includes(',') ? `"${escaped}"` : escaped;
        } else {
          return String(value);
        }
      });

      csv += row.join(',') + '\n';
    });

    return csv;
  }

  private parseCSV(csvText: string, _type: string): Record<string, unknown>[] {
    // Simple CSV parsing - in a real app, use a proper CSV parser library
    const lines = csvText.split('\n').filter((line) => line.trim() !== '');

    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    // Parse headers
    const headers = lines[0].split(',').map((header) => header.trim());

    // Parse data rows
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values: string[] = [];
      let inQuote = false;
      let currentValue = '';

      // Parse CSV line manually to handle quotes
      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (char === '"') {
          if (inQuote && j + 1 < line.length && line[j + 1] === '"') {
            // Double quote inside quoted value
            currentValue += '"';
            j++; // Skip next quote
          } else {
            // Toggle quote state
            inQuote = !inQuote;
          }
        } else if (char === ',' && !inQuote) {
          // End of value
          values.push(currentValue);
          currentValue = '';
        } else {
          // Add to current value
          currentValue += char;
        }
      }

      // Add last value
      values.push(currentValue);

      // Create object from headers and values
      const obj: Record<string, unknown> = {};

      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        const value = j < values.length ? values[j] : '';

        // Convert value types as needed
        obj[header] = this.convertValueType(value, header);
      }

      data.push(obj);
    }

    return data;
  }

  private convertValueType(value: string, header: string): unknown {
    // Convert string values to appropriate types based on the header
    if (value === '') {
      return null;
    }

    // Date fields
    if (header.toLowerCase().includes('date')) {
      return new Date(value);
    }

    // Number fields
    if (
      header.toLowerCase().includes('amount') ||
      header.toLowerCase().includes('balance') ||
      header === 'id' ||
      header === '_id'
    ) {
      const num = Number(value);
      return isNaN(num) ? value : num;
    }

    // Boolean fields
    if (value.toLowerCase() === 'true') {
      return true;
    }

    if (value.toLowerCase() === 'false') {
      return false;
    }

    // Default to string
    return value;
  }

  private async importTransactions(
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transactions: any[],
    stats: ImportStats,
  ): Promise<void> {
    for (const transaction of transactions) {
      try {
        // Prepare transaction object with userId
        const transactionData = {
          ...transaction,
          userId,
          date: transaction.date ? new Date(transaction.date) : new Date(),
          // Ensure required fields
          description: transaction.description || 'Imported Transaction',
          status: transaction.status || 'cleared',
        };

        // Remove _id if present (we'll create a new one)
        delete transactionData._id;

        // Create transaction
        await this.transactionModel.create(transactionData);
        stats.imported++;
      } catch (error) {
        this.logger.error({ error, transaction }, 'Error importing transaction');
        stats.errors++;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async importBudgets(userId: string, budgets: any[], stats: ImportStats): Promise<void> {
    for (const budget of budgets) {
      try {
        // Prepare budget object with userId
        const budgetData = {
          ...budget,
          userId,
          startDate: budget.startDate ? new Date(budget.startDate) : new Date(),
          endDate: budget.endDate
            ? new Date(budget.endDate)
            : new Date(new Date().setMonth(new Date().getMonth() + 1)),
          // Ensure required fields
          name: budget.name || 'Imported Budget',
          totalAllocated: budget.totalAllocated || 0,
          totalSpent: budget.totalSpent || 0,
          income: budget.income || 0,
          categories: budget.categories || [],
        };

        // Remove _id if present (we'll create a new one)
        delete budgetData._id;

        // Create budget
        await this.budgetModel.create(budgetData);
        stats.imported++;
      } catch (error) {
        this.logger.error({ error, budget }, 'Error importing budget');
        stats.errors++;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async importGoals(userId: string, goals: any[], stats: ImportStats): Promise<void> {
    for (const goal of goals) {
      try {
        // Prepare goal object with userId
        const goalData = {
          ...goal,
          userId,
          startDate: goal.startDate ? new Date(goal.startDate) : new Date(),
          targetDate: goal.targetDate
            ? new Date(goal.targetDate)
            : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          // Ensure required fields
          name: goal.name || 'Imported Goal',
          type: goal.type || 'savings',
          targetAmount: goal.targetAmount || 1000,
          currentAmount: goal.currentAmount || 0,
          status: goal.status || 'active',
          priority: goal.priority || 2,
        };

        // Remove _id if present (we'll create a new one)
        delete goalData._id;

        // Create goal
        await this.goalModel.create(goalData);
        stats.imported++;
      } catch (error) {
        this.logger.error({ error, goal }, 'Error importing goal');
        stats.errors++;
      }
    }
  }

  private async clearUserTransactions(userId: string): Promise<void> {
    // Delete all transactions for user
    await this.transactionModel.collection.deleteMany({ userId });
  }

  private async clearUserBudgets(userId: string): Promise<void> {
    // Delete all budgets for user
    await this.budgetModel.collection.deleteMany({ userId });
  }

  private async clearUserGoals(userId: string): Promise<void> {
    // Delete all goals for user
    await this.goalModel.collection.deleteMany({ userId });
  }

  private async clearUserAccounts(userId: string): Promise<void> {
    // Delete all accounts for user
    await this.accountModel.collection.deleteMany({ userId });

    // Also delete account connections
    await this.accountConnectionModel.collection.deleteMany({ userId });
  }
}
