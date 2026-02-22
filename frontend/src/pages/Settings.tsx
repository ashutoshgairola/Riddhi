// src/pages/Settings.tsx
import { FC, useState } from 'react';

import PageHeader from '../components/common/PageHeader';
import DataManagement from '../components/settings/DataManagement';
import NotificationSettings from '../components/settings/NotificationSettings';
import PreferencesForm from '../components/settings/PreferencesForm';
import ProfileForm from '../components/settings/ProfileForm';
import SecuritySettings from '../components/settings/SecuritySettings';

type Tab = 'profile' | 'notifications' | 'security' | 'preferences' | 'data';

interface NavButtonProps {
  id: Tab;
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: (id: Tab) => void;
}

const NavButton: FC<NavButtonProps> = ({ id, label, active, disabled, onClick }) => (
  <button
    disabled={disabled}
    className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition-colors ${
      disabled
        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
        : active
          ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
    }`}
    onClick={() => !disabled && onClick(id)}
  >
    {label}
    {disabled && (
      <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-full">
        Coming soon
      </span>
    )}
  </button>
);

const Settings: FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const TABS: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'data', label: 'Data Management' },
  ];

  const TITLES: Record<Tab, string> = {
    profile: 'Profile Settings',
    notifications: 'Notification Settings',
    security: 'Security Settings',
    preferences: 'Preferences',
    data: 'Data Management',
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account preferences" />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-medium dark:text-gray-100">Settings</h3>
            </div>
            <nav className="p-2">
              {TABS.map((tab) => (
                <NavButton
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  active={activeTab === tab.id}
                  disabled={tab.disabled}
                  onClick={setActiveTab}
                />
              ))}

              {/* Disabled Account Connections */}
              <NavButton
                id={'profile' as Tab}
                label="Account Connections"
                active={false}
                disabled
                onClick={() => {}}
              />
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-gray-100">{TITLES[activeTab]}</h2>
            </div>
            <div className="p-6">
              {activeTab === 'profile' && <ProfileForm />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'security' && <SecuritySettings />}
              {activeTab === 'preferences' && <PreferencesForm />}
              {activeTab === 'data' && <DataManagement />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
