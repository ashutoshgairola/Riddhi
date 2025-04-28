import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

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

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  // User Preferences
  getUserPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const preferences = await this.settingsService.getUserPreferences(userId);
      res.status(200).json(preferences);
    } catch (error: any) {
      console.error('Error fetching user preferences:', error);
      res.status(500).json({ error: 'Failed to fetch user preferences' });
    }
  };

  updateUserPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const updates: UpdateUserPreferencesRequest = req.body;

      const preferences = await this.settingsService.updateUserPreferences(userId, updates);
      res.status(200).json(preferences);
    } catch (error: any) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({ error: 'Failed to update user preferences' });
    }
  };

  // Notification Settings
  getNotificationSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const settings = await this.settingsService.getNotificationSettings(userId);
      res.status(200).json(settings);
    } catch (error: any) {
      console.error('Error fetching notification settings:', error);
      res.status(500).json({ error: 'Failed to fetch notification settings' });
    }
  };

  updateNotificationSetting = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
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
      } catch (error: any) {
        if (error.message === 'Notification setting not found') {
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error updating notification setting:', error);
      res.status(500).json({ error: 'Failed to update notification setting' });
    }
  };

  // Account Connections
  getAccountConnections = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const connections = await this.settingsService.getAccountConnections(userId);
      res.status(200).json(connections);
    } catch (error: any) {
      console.error('Error fetching account connections:', error);
      res.status(500).json({ error: 'Failed to fetch account connections' });
    }
  };

  connectAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const connectionData: ConnectAccountRequest = req.body;

      // Basic validation
      if (!connectionData.institutionId || !connectionData.credentials) {
        res.status(400).json({ error: 'Institution ID and credentials are required' });
        return;
      }

      try {
        const connection = await this.settingsService.connectAccount(userId, connectionData);
        res.status(201).json(connection);
      } catch (error: any) {
        if (error.message.includes('credentials')) {
          res.status(400).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error connecting account:', error);
      res.status(500).json({ error: 'Failed to connect account' });
    }
  };

  refreshConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      try {
        const connection = await this.settingsService.refreshConnection(id, userId);
        res.status(200).json(connection);
      } catch (error: any) {
        if (error.message === 'Connection not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Connection is not active') {
          res.status(400).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error refreshing connection:', error);
      res.status(500).json({ error: 'Failed to refresh connection' });
    }
  };

  disconnectAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      try {
        await this.settingsService.disconnectAccount(id, userId);
        res.status(204).send();
      } catch (error: any) {
        if (error.message === 'Connection not found') {
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error disconnecting account:', error);
      res.status(500).json({ error: 'Failed to disconnect account' });
    }
  };

  // Data Management
  exportData = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const query: ExportDataQuery = req.query as any;

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
      } catch (error: any) {
        if (error.message === 'Invalid format') {
          res.status(400).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error exporting data:', error);
      res.status(500).json({ error: 'Failed to export data' });
    }
  };

  importData = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
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
      } catch (error: any) {
        if (error.message.includes('format') || error.message.includes('type')) {
          res.status(400).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error importing data:', error);
      res.status(500).json({ error: 'Failed to import data' });
    }
  };

  clearData = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
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
      } catch (error: any) {
        if (error.message.includes('confirmation') || error.message.includes('type')) {
          res.status(400).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error clearing data:', error);
      res.status(500).json({ error: 'Failed to clear data' });
    }
  };
}
