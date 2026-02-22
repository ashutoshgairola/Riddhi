import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

import { getErrorMessage } from '../common/utils';
import { createChildLogger } from '../config/logger';
import { SettingsService } from './service';
import {
  ClearDataRequest,
  ConnectAccountRequest,
  ExportDataQuery,
  UpdateNotificationSettingRequest,
  UpdateUserPreferencesRequest,
} from './types/interface';

export class SettingsController {
  private settingsService: SettingsService;
  private logger = createChildLogger({ controller: 'SettingsController' });

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  // User Preferences
  getUserPreferences = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'getUserPreferences' });

    try {
      const { userId } = req.body.user;
      delete req.body.user;

      requestLogger.info({ userId }, 'Getting user preferences');

      const preferences = await this.settingsService.getUserPreferences(userId);

      requestLogger.info({ userId }, 'User preferences fetched successfully');

      res.status(200).json(preferences);
    } catch (error: unknown) {
      requestLogger.error({ error }, 'Error fetching user preferences');
      res.status(500).json({ error: 'Failed to fetch user preferences' });
    }
  };

  updateUserPreferences = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'updateUserPreferences' });

    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const updates: UpdateUserPreferencesRequest = req.body;

      requestLogger.info({ userId }, 'Updating user preferences');

      const preferences = await this.settingsService.updateUserPreferences(userId, updates);

      requestLogger.info({ userId }, 'User preferences updated successfully');

      res.status(200).json(preferences);
    } catch (error: unknown) {
      requestLogger.error({ error }, 'Error updating user preferences');
      res.status(500).json({ error: 'Failed to update user preferences' });
    }
  };

  // Notification Settings
  getNotificationSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;

      const settings = await this.settingsService.getNotificationSettings(userId);
      res.status(200).json(settings);
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error fetching notification settings:');
      res.status(500).json({ error: 'Failed to fetch notification settings' });
    }
  };

  updateNotificationSetting = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const { id } = req.params;
      const updates: UpdateNotificationSettingRequest = req.body;

      // Basic validation
      if (updates.email === undefined && updates.push === undefined && updates.sms === undefined) {
        res.status(400).json({ error: 'No updates provided' });
        return;
      }

      try {
        const setting = await this.settingsService.updateNotificationSetting(id, userId, updates);
        res.status(200).json(setting);
      } catch (error: unknown) {
        if (getErrorMessage(error) === 'Notification setting not found') {
          res.status(404).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error updating notification setting:');
      res.status(500).json({ error: 'Failed to update notification setting' });
    }
  };

  // Account Connections
  getAccountConnections = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;

      const connections = await this.settingsService.getAccountConnections(userId);
      res.status(200).json(connections);
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error fetching account connections:');
      res.status(500).json({ error: 'Failed to fetch account connections' });
    }
  };

  connectAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const connectionData: ConnectAccountRequest = req.body;

      // Basic validation
      if (!connectionData.institutionId || !connectionData.credentials) {
        res.status(400).json({ error: 'Institution ID and credentials are required' });
        return;
      }

      try {
        const connection = await this.settingsService.connectAccount(userId, connectionData);
        res.status(201).json(connection);
      } catch (error: unknown) {
        if (getErrorMessage(error).includes('credentials')) {
          res.status(400).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error connecting account:');
      res.status(500).json({ error: 'Failed to connect account' });
    }
  };

  refreshConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const { id } = req.params;

      try {
        const connection = await this.settingsService.refreshConnection(id, userId);
        res.status(200).json(connection);
      } catch (error: unknown) {
        if (getErrorMessage(error) === 'Connection not found') {
          res.status(404).json({ error: getErrorMessage(error) });
        } else if (getErrorMessage(error) === 'Connection is not active') {
          res.status(400).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error refreshing connection:');
      res.status(500).json({ error: 'Failed to refresh connection' });
    }
  };

  disconnectAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const { id } = req.params;

      try {
        await this.settingsService.disconnectAccount(id, userId);
        res.status(204).send();
      } catch (error: unknown) {
        if (getErrorMessage(error) === 'Connection not found') {
          res.status(404).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error disconnecting account:');
      res.status(500).json({ error: 'Failed to disconnect account' });
    }
  };

  // Data Management
  exportData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const query: ExportDataQuery = req.query as unknown as ExportDataQuery;

      // Validate format
      if (query.format !== 'json' && query.format !== 'csv') {
        res.status(400).json({ error: 'Invalid format. Supported formats: json, csv' });
        return;
      }

      try {
        const { filePath, contentType } = await this.settingsService.exportData(userId, query);

        // Set headers for file download
        const filename = path.basename(filePath);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // Clean up file after sending
        fileStream.on('end', () => {
          fs.unlinkSync(filePath);
        });
      } catch (error: unknown) {
        if (getErrorMessage(error) === 'Invalid format') {
          res.status(400).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error exporting data:');
      res.status(500).json({ error: 'Failed to export data' });
    }
  };

  importData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const file = req.file;
      const { type } = req.body;

      // Validate file and type
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      if (!type || !['transactions', 'budgets', 'goals'].includes(type)) {
        res.status(400).json({
          error: 'Invalid data type. Supported types: transactions, budgets, goals',
        });
        return;
      }

      try {
        const stats = await this.settingsService.importData(userId, file, type);
        res.status(200).json({
          message: 'Import successful',
          stats,
        });
      } catch (error: unknown) {
        if (getErrorMessage(error).includes('format') || getErrorMessage(error).includes('type')) {
          res.status(400).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error importing data:');
      res.status(500).json({ error: 'Failed to import data' });
    }
  };

  clearData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body.user;
      delete req.body.user;
      const clearRequest: ClearDataRequest = req.body;

      // Validate request
      if (!Array.isArray(clearRequest.types) || clearRequest.types.length === 0) {
        res.status(400).json({ error: 'Invalid data types' });
        return;
      }

      if (!clearRequest.confirmation || clearRequest.confirmation !== 'DELETE MY DATA') {
        res.status(400).json({
          error: 'Invalid confirmation text. Must be exactly "DELETE MY DATA"',
        });
        return;
      }

      // Validate each type
      const validTypes = ['transactions', 'budgets', 'goals', 'accounts'];
      for (const type of clearRequest.types) {
        if (!validTypes.includes(type)) {
          res.status(400).json({
            error: `Invalid data type: ${type}. Supported types: ${validTypes.join(', ')}`,
          });
          return;
        }
      }

      try {
        await this.settingsService.clearData(userId, clearRequest);
        res.status(200).json({ message: 'Data cleared successfully' });
      } catch (error: unknown) {
        if (
          getErrorMessage(error).includes('confirmation') ||
          getErrorMessage(error).includes('type')
        ) {
          res.status(400).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error clearing data:');
      res.status(500).json({ error: 'Failed to clear data' });
    }
  };
}
