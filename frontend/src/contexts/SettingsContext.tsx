// src/contexts/SettingsContext.tsx
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface AccountConnection {
  id: string;
  name: string;
  type: 'bank' | 'credit_card' | 'investment';
  institutionName: string;
  institutionLogo?: string;
  isConnected: boolean;
  lastUpdated?: string;
  accounts: string[]; // IDs of connected accounts
}

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface UserPreferences {
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  startOfWeek: 'sunday' | 'monday';
  language: string;
}

interface SettingsContextType {
  accountConnections: AccountConnection[];
  notificationSettings: NotificationSetting[];
  userPreferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
  getAccountConnections: () => Promise<AccountConnection[]>;
  connectAccount: (
    connection: Omit<AccountConnection, 'id' | 'isConnected' | 'lastUpdated' | 'accounts'>,
  ) => Promise<AccountConnection>;
  disconnectAccount: (id: string) => Promise<void>;
  refreshAccount: (id: string) => Promise<AccountConnection>;
  getNotificationSettings: () => Promise<NotificationSetting[]>;
  updateNotificationSetting: (
    id: string,
    settings: Partial<NotificationSetting>,
  ) => Promise<NotificationSetting>;
  getUserPreferences: () => Promise<UserPreferences>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<UserPreferences>;
  exportData: (format: 'csv' | 'json') => Promise<string>;
  importData: (data: string, format: 'csv' | 'json') => Promise<void>;
  clearData: (dataTypes: string[]) => Promise<void>;
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Dummy account connections
const dummyAccountConnections: AccountConnection[] = [
  {
    id: '1',
    name: 'Chase Bank',
    type: 'bank',
    institutionName: 'JPMorgan Chase',
    institutionLogo: 'https://logo.clearbit.com/chase.com',
    isConnected: true,
    lastUpdated: '2025-04-22T12:30:00Z',
    accounts: ['1', '2'],
  },
  {
    id: '2',
    name: 'American Express',
    type: 'credit_card',
    institutionName: 'American Express',
    institutionLogo: 'https://logo.clearbit.com/americanexpress.com',
    isConnected: true,
    lastUpdated: '2025-04-22T12:30:00Z',
    accounts: ['3'],
  },
  {
    id: '3',
    name: 'Fidelity Investments',
    type: 'investment',
    institutionName: 'Fidelity',
    institutionLogo: 'https://logo.clearbit.com/fidelity.com',
    isConnected: false,
    accounts: [],
  },
];

// Dummy notification settings
const dummyNotificationSettings: NotificationSetting[] = [
  {
    id: 'bill-reminders',
    name: 'Bill Reminders',
    description: 'Get notified when bills are due',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'budget-alerts',
    name: 'Budget Alerts',
    description: "Get notified when you're close to or exceed your budget",
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'large-transactions',
    name: 'Large Transactions',
    description: 'Get notified of unusually large transactions',
    email: false,
    push: true,
    sms: false,
  },
  {
    id: 'goal-milestones',
    name: 'Goal Milestones',
    description: 'Get notified when you reach a goal milestone',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'account-updates',
    name: 'Account Updates',
    description: 'Get notified of account balance updates',
    email: false,
    push: false,
    sms: false,
  },
];

// Dummy user preferences - in real app, load from localStorage/API
const getInitialUserPreferences = (): UserPreferences => {
  const defaultPreferences = {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light' as const,
    startOfWeek: 'sunday' as const,
    language: 'en',
  };

  try {
    const stored = localStorage.getItem('userPreferences');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultPreferences, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load preferences from localStorage:', error);
  }

  return defaultPreferences;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accountConnections, setAccountConnections] = useState<AccountConnection[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [userPreferences, setUserPreferences] =
    useState<UserPreferences>(getInitialUserPreferences);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        // Simulate API fetch with a delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setAccountConnections(dummyAccountConnections);
        setNotificationSettings(dummyNotificationSettings);
        setUserPreferences(getInitialUserPreferences());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Get account connections
  const getAccountConnections = async (): Promise<AccountConnection[]> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));

      setError(null);
      return accountConnections;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account connections');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Connect a new account
  const connectAccount = async (
    connection: Omit<AccountConnection, 'id' | 'isConnected' | 'lastUpdated' | 'accounts'>,
  ): Promise<AccountConnection> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate a new ID (in a real app, this would be done by the backend)
      const newConnection: AccountConnection = {
        ...connection,
        id: Date.now().toString(),
        isConnected: true,
        lastUpdated: new Date().toISOString(),
        accounts: [],
      };

      // Update state
      setAccountConnections((prev) => [...prev, newConnection]);
      setError(null);

      return newConnection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect account');
      throw new Error('Failed to connect account');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect an account
  const disconnectAccount = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update the connection
      const updatedConnections = accountConnections.map((conn) =>
        conn.id === id
          ? {
              ...conn,
              isConnected: false,
              lastUpdated: new Date().toISOString(),
              accounts: [],
            }
          : conn,
      );

      // Update state
      setAccountConnections(updatedConnections);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect account');
      throw new Error('Failed to disconnect account');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh an account connection
  const refreshAccount = async (id: string): Promise<AccountConnection> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the connection
      const updatedConnections = accountConnections.map((conn) =>
        conn.id === id ? { ...conn, lastUpdated: new Date().toISOString() } : conn,
      );

      const updatedConnection = updatedConnections.find((conn) => conn.id === id);

      if (!updatedConnection) {
        throw new Error('Account connection not found');
      }

      // Update state
      setAccountConnections(updatedConnections);
      setError(null);

      return updatedConnection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh account');
      throw new Error('Failed to refresh account');
    } finally {
      setIsLoading(false);
    }
  };

  // Get notification settings
  const getNotificationSettings = async (): Promise<NotificationSetting[]> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));

      setError(null);
      return notificationSettings;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notification settings');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Update notification setting
  const updateNotificationSetting = async (
    id: string,
    settings: Partial<NotificationSetting>,
  ): Promise<NotificationSetting> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Find and update the setting
      const updatedSettings = notificationSettings.map((setting) =>
        setting.id === id ? { ...setting, ...settings } : setting,
      );

      const updatedSetting = updatedSettings.find((setting) => setting.id === id);

      if (!updatedSetting) {
        throw new Error('Notification setting not found');
      }

      // Update state
      setNotificationSettings(updatedSettings);
      setError(null);

      return updatedSetting;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification setting');
      throw new Error('Failed to update notification setting');
    } finally {
      setIsLoading(false);
    }
  };

  // Get user preferences
  const getUserPreferences = async (): Promise<UserPreferences> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));

      setError(null);
      return userPreferences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user preferences');
      throw new Error('Failed to fetch user preferences');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user preferences
  const updateUserPreferences = async (
    preferences: Partial<UserPreferences>,
  ): Promise<UserPreferences> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Update preferences
      const updatedPreferences = { ...userPreferences, ...preferences };

      // Persist to localStorage
      try {
        localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
      } catch (error) {
        console.warn('Failed to save preferences to localStorage:', error);
      }

      // Update state
      setUserPreferences(updatedPreferences);
      setError(null);

      return updatedPreferences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user preferences');
      throw new Error('Failed to update user preferences');
    } finally {
      setIsLoading(false);
    }
  };

  // Export data
  const exportData = async (format: 'csv' | 'json'): Promise<string> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would generate and download the data
      const exportUrl = `data-export-${Date.now()}.${format}`;

      setError(null);
      return exportUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw new Error('Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  // Import data
  const importData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would parse and import the data

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data');
      throw new Error('Failed to import data');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear data
  const clearData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would clear the selected data types

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear data');
      throw new Error('Failed to clear data');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    accountConnections,
    notificationSettings,
    userPreferences,
    isLoading,
    error,
    getAccountConnections,
    connectAccount,
    disconnectAccount,
    refreshAccount,
    getNotificationSettings,
    updateNotificationSetting,
    getUserPreferences,
    updateUserPreferences,
    exportData,
    importData,
    clearData,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// Custom hook for using settings context
// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
};
