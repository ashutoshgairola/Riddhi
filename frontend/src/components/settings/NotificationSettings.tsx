// src/components/settings/NotificationSettings.tsx
import { FC, useState } from 'react';

import { Bell, BellOff, Loader2 } from 'lucide-react';

import { useSettings } from '../../contexts/SettingsContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const PushSubscriptionCard: FC = () => {
  const { isSupported, permission, isSubscribed, loading, subscribe, unsubscribe } =
    usePushNotifications();

  if (!isSupported) {
    return (
      <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-start gap-4">
      <div
        className={`mt-0.5 p-2 rounded-full ${isSubscribed ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
      >
        {isSubscribed ? <Bell size={18} /> : <BellOff size={18} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium dark:text-gray-100">Browser Push Notifications</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {permission === 'denied'
            ? 'Permission blocked — enable notifications in your browser settings.'
            : isSubscribed
              ? 'This browser will receive real-time push notifications from Riddhi.'
              : 'Get real-time alerts directly in your browser, even when the app is closed.'}
        </p>
      </div>

      <button
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={loading || permission === 'denied'}
        className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isSubscribed
            ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isSubscribed ? (
          <>
            <BellOff size={14} /> Disable
          </>
        ) : (
          <>
            <Bell size={14} /> Enable
          </>
        )}
      </button>
    </div>
  );
};

const NotificationSettings: FC = () => {
  const { notificationSettings, updateNotificationSetting, isLoading } = useSettings();
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (id: string, channel: 'email' | 'push' | 'sms') => {
    const setting = notificationSettings.find((s) => s.id === id);
    if (!setting) return;
    setSaving(`${id}-${channel}`);
    setError(null);
    try {
      await updateNotificationSetting(id, { [channel]: !setting[channel] });
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  if (isLoading && notificationSettings.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 size={24} className="animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Choose how and when you'd like to be notified about your finances.
      </p>

      <PushSubscriptionCard />

      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}

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
            {notificationSettings.map((setting) => (
              <tr key={setting.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-4">
                  <p className="font-medium dark:text-gray-200">{setting.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                </td>
                {(['email', 'push', 'sms'] as const).map((channel) => (
                  <td key={channel} className="text-center">
                    {saving === `${setting.id}-${channel}` ? (
                      <Loader2 size={14} className="animate-spin text-green-600 inline-block" />
                    ) : (
                      <input
                        type="checkbox"
                        checked={setting[channel]}
                        onChange={() => handleToggle(setting.id, channel)}
                        className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 cursor-pointer"
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationSettings;
