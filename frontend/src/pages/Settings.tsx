// src/pages/Settings.tsx
import { FC, useState } from 'react';

import PageHeader from '../components/common/PageHeader';
import AccountConnectionCard from '../components/settings/AccountConnectionCard';
import NotificationSettings from '../components/settings/NotificationSettings';
import ProfileForm from '../components/settings/ProfileForm';
import SecuritySettings from '../components/settings/SecuritySettings';

const Settings: FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account preferences" />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-medium dark:text-gray-100">Settings</h3>
            </div>

            <nav className="p-2">
              <button
                className={`w-full text-left px-4 py-2 rounded-lg mb-1 ${
                  activeTab === 'profile'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>

              <button
                className={`w-full text-left px-4 py-2 rounded-lg mb-1 ${
                  activeTab === 'connections'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setActiveTab('connections')}
              >
                Account Connections
              </button>

              <button
                className={`w-full text-left px-4 py-2 rounded-lg mb-1 ${
                  activeTab === 'notifications'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </button>

              <button
                className={`w-full text-left px-4 py-2 rounded-lg mb-1 ${
                  activeTab === 'security'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setActiveTab('security')}
              >
                Security
              </button>

              <button
                className={`w-full text-left px-4 py-2 rounded-lg mb-1 ${
                  activeTab === 'preferences'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                Preferences
              </button>

              <button
                className={`w-full text-left px-4 py-2 rounded-lg mb-1 ${
                  activeTab === 'data'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setActiveTab('data')}
              >
                Data Management
              </button>
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold dark:text-gray-100">Profile Settings</h2>
              </div>

              <div className="p-6">
                <ProfileForm />
              </div>
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold dark:text-gray-100">Account Connections</h2>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Connect your financial accounts to automatically import transactions and track
                  your finances.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <AccountConnectionCard
                    name="Chase Bank"
                    type="Bank"
                    isConnected={true}
                    lastUpdated="2025-04-22T12:30:00"
                    logo="https://logo.clearbit.com/chase.com"
                  />

                  <AccountConnectionCard
                    name="American Express"
                    type="Credit Card"
                    isConnected={true}
                    lastUpdated="2025-04-22T12:30:00"
                    logo="https://logo.clearbit.com/americanexpress.com"
                  />

                  <AccountConnectionCard
                    name="Fidelity Investments"
                    type="Investment"
                    isConnected={false}
                    logo="https://logo.clearbit.com/fidelity.com"
                  />

                  <button className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300">
                    <p className="font-medium">+ Connect New Account</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold dark:text-gray-100">Notification Settings</h2>
              </div>

              <div className="p-6">
                <NotificationSettings />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold dark:text-gray-100">Security Settings</h2>
              </div>

              <div className="p-6">
                <SecuritySettings />
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold dark:text-gray-100">Preferences</h2>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium dark:text-gray-100 mb-3">Currency</h3>
                    <select className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option>JPY (¥)</option>
                      <option>CAD ($)</option>
                      <option>AUD ($)</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium dark:text-gray-100 mb-3">Date Format</h3>
                    <select className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  // Continuing src/pages/Settings.tsx
                  <div>
                    <h3 className="text-lg font-medium dark:text-gray-100 mb-3">Theme</h3>
                    <div className="grid grid-cols-3 gap-4 max-w-md">
                      <div className="border border-green-500 rounded-lg p-2 cursor-pointer">
                        <div className="h-16 bg-white rounded mb-2"></div>
                        <p className="text-center text-sm dark:text-gray-300">Light</p>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-2 cursor-pointer">
                        <div className="h-16 bg-gray-800 rounded mb-2"></div>
                        <p className="text-center text-sm dark:text-gray-300">Dark</p>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-2 cursor-pointer">
                        <div className="h-16 bg-gradient-to-b from-white to-gray-800 rounded mb-2"></div>
                        <p className="text-center text-sm dark:text-gray-300">System</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium dark:text-gray-100 mb-3">Start of Week</h3>
                    <select className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option>Sunday</option>
                      <option>Monday</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium dark:text-gray-100 mb-3">Language</h3>
                    <select className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Japanese</option>
                    </select>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold dark:text-gray-100">Data Management</h2>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium dark:text-gray-100 mb-3">Export Data</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Download all your financial data in a standard format.
                    </p>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300">
                        Export as CSV
                      </button>
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300">
                        Export as JSON
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium dark:text-gray-100 mb-3">Import Data</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Import data from another financial application.
                    </p>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300">
                        Import Data
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium dark:text-gray-100 mb-3">Clear Data</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Remove selected categories of data from your account.
                    </p>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="clear-transactions"
                          className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                        />
                        <label htmlFor="clear-transactions" className="ml-2 dark:text-gray-300">
                          Transactions
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="clear-budgets"
                          className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                        />
                        <label htmlFor="clear-budgets" className="ml-2 dark:text-gray-300">
                          Budgets
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="clear-goals"
                          className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                        />
                        <label htmlFor="clear-goals" className="ml-2 dark:text-gray-300">
                          Goals
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="clear-investments"
                          className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                        />
                        <label htmlFor="clear-investments" className="ml-2 dark:text-gray-300">
                          Investments
                        </label>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Clear Selected Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
