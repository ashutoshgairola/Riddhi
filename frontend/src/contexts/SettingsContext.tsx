// src/contexts/SettingsContext.tsx
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import settingsService from '../services/api/settingsService';
import {
  NotificationSettingDTO,
  UpdateNotificationSettingRequest,
  UpdateUserPreferencesRequest,
  UserPreferencesDTO,
} from '../types/settings.types';

interface SettingsContextType {
  userPreferences: UserPreferencesDTO;
  notificationSettings: NotificationSettingDTO[];
  isLoading: boolean;
  error: string | null;
  updateUserPreferences: (updates: UpdateUserPreferencesRequest) => Promise<void>;
  updateNotificationSetting: (
    id: string,
    updates: UpdateNotificationSettingRequest,
  ) => Promise<void>;
  refetchPreferences: () => Promise<void>;
  refetchNotifications: () => Promise<void>;
}

const DEFAULT_PREFERENCES: UserPreferencesDTO = {
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  theme: 'light',
  startOfWeek: 'sunday',
  language: 'en',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getStoredPreferences = (): UserPreferencesDTO => {
  try {
    const stored = localStorage.getItem('userPreferences');
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_PREFERENCES;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferencesDTO>(getStoredPreferences);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchPreferences = useCallback(async () => {
    try {
      const prefs = await settingsService.getUserPreferences();
      setUserPreferences(prefs);
      try {
        localStorage.setItem('userPreferences', JSON.stringify(prefs));
      } catch {
        // ignore storage errors
      }
    } catch {
      // keep defaults on error
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await settingsService.getNotificationSettings();
      setNotificationSettings(res.data);
    } catch {
      // keep empty on error
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    setIsLoading(true);
    Promise.all([fetchPreferences(), fetchNotifications()])
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load settings'))
      .finally(() => setIsLoading(false));
  }, [fetchPreferences, fetchNotifications]);

  const updateUserPreferences = async (updates: UpdateUserPreferencesRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await settingsService.updateUserPreferences(updates);
      setUserPreferences(updated);
      try {
        localStorage.setItem('userPreferences', JSON.stringify(updated));
      } catch {
        // ignore
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationSetting = async (
    id: string,
    updates: UpdateNotificationSettingRequest,
  ): Promise<void> => {
    // Optimistic update
    setNotificationSettings((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    try {
      const updated = await settingsService.updateNotificationSetting(id, updates);
      setNotificationSettings((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      // Rollback on failure
      await fetchNotifications();
      throw err;
    }
  };

  const value: SettingsContextType = {
    userPreferences,
    notificationSettings,
    isLoading,
    error,
    updateUserPreferences,
    updateNotificationSetting,
    refetchPreferences: fetchPreferences,
    refetchNotifications: fetchNotifications,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
