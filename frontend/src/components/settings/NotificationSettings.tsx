// src/components/settings/NotificationSettings.tsx
import { FC, useState } from 'react';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

const NotificationSettings: FC = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
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
  ]);

  const handleToggle = (id: string, channel: 'email' | 'push' | 'sms') => {
    setSettings((prevSettings) =>
      prevSettings.map((setting) =>
        setting.id === id ? { ...setting, [channel]: !setting[channel] } : setting,
      ),
    );
  };

  const handleSave = () => {
    console.log('Notification settings saved:', settings);
    // Handle save logic here
  };

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Choose how and when you'd like to be notified about your finances.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 dark:text-gray-300">Notification</th>
              <th className="text-center py-2 dark:text-gray-300">Email</th>
              <th className="text-center py-2 dark:text-gray-300">Push</th>
              <th className="text-center py-2 dark:text-gray-300">SMS</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((setting) => (
              <tr key={setting.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-4">
                  <p className="font-medium dark:text-gray-200">{setting.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={setting.email}
                    onChange={() => handleToggle(setting.id, 'email')}
                    className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={setting.push}
                    onChange={() => handleToggle(setting.id, 'push')}
                    className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={setting.sms}
                    onChange={() => handleToggle(setting.id, 'sms')}
                    className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Save Notification Settings
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
