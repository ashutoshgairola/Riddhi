// src/services/api/settingsService.ts
import {
  ClearDataRequest,
  ImportStats,
  NotificationSettingDTO,
  UpdateNotificationSettingRequest,
  UpdateUserPreferencesRequest,
  UserPreferencesDTO,
} from '../../types/settings.types';
import apiClient from './apiClient';

class SettingsService {
  private baseUrl = '/api/settings';

  // ----- User Preferences -----

  public async getUserPreferences(): Promise<UserPreferencesDTO> {
    return apiClient.get<UserPreferencesDTO>(`${this.baseUrl}/preferences`);
  }

  public async updateUserPreferences(
    updates: UpdateUserPreferencesRequest,
  ): Promise<UserPreferencesDTO> {
    return apiClient.put<UserPreferencesDTO, UpdateUserPreferencesRequest>(
      `${this.baseUrl}/preferences`,
      updates,
    );
  }

  // ----- Notification Settings -----

  public async getNotificationSettings(): Promise<{ data: NotificationSettingDTO[] }> {
    return apiClient.get<{ data: NotificationSettingDTO[] }>(`${this.baseUrl}/notifications`);
  }

  public async updateNotificationSetting(
    id: string,
    updates: UpdateNotificationSettingRequest,
  ): Promise<NotificationSettingDTO> {
    return apiClient.put<NotificationSettingDTO, UpdateNotificationSettingRequest>(
      `${this.baseUrl}/notifications/${id}`,
      updates,
    );
  }

  // ----- Data Management -----

  public async exportData(format: 'csv' | 'json', type?: string): Promise<Blob> {
    const params = new URLSearchParams({ format });
    if (type) params.append('type', type);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}${this.baseUrl}/data/export?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token') ?? ''}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to export data');
    }

    return response.blob();
  }

  public async importData(file: File, type: string): Promise<ImportStats> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${import.meta.env.VITE_API_URL}${this.baseUrl}/data/import`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token') ?? ''}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to import data');
    }

    const json = await response.json();
    return json.stats as ImportStats;
  }

  public async clearData(request: ClearDataRequest): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/data`, { data: request });
  }
}

export const settingsService = new SettingsService();
export default settingsService;
