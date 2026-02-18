// src/components/settings/SecuritySettings.tsx
import { FC, useState } from 'react';

import { Key, Shield, Smartphone } from 'lucide-react';

const SecuritySettings: FC = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEnableTwoFactor, setShowEnableTwoFactor] = useState(false);

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Manage your account security settings and multi-factor authentication.
      </p>

      <div className="space-y-6">
        {/* Password Section */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-start">
            <div className="mr-4 p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
              <Key size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium dark:text-gray-100">Password</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last changed 30 days ago
              </p>

              {!showChangePassword ? (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="mt-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  Change Password
                </button>
              ) : (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowChangePassword(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                      Update Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-start">
            <div className="mr-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Smartphone size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium dark:text-gray-100">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add an extra layer of security to your account
              </p>

              {!showEnableTwoFactor ? (
                <button
                  onClick={() => setShowEnableTwoFactor(true)}
                  className="mt-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  Enable Two-Factor Authentication
                </button>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="text-sm dark:text-gray-300">
                    Two-factor authentication adds an additional layer of security to your account
                    by requiring a verification code along with your password.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowEnableTwoFactor(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                      Send Verification Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Login History */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-start">
            <div className="mr-4 p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
              <Shield size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium dark:text-gray-100">Login History</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Recent login activity on your account
              </p>

              <div className="mt-4 space-y-3">
                <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                  <p className="font-medium dark:text-gray-200">Today at 10:30 AM</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Safari on MacOS - New York, USA
                  </p>
                </div>

                <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                  <p className="font-medium dark:text-gray-200">Yesterday at 8:15 PM</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chrome on Windows - New York, USA
                  </p>
                </div>

                <div>
                  <p className="font-medium dark:text-gray-200">April 20, 2025 at 3:45 PM</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chrome on iOS - Boston, USA
                  </p>
                </div>
              </div>

              <button className="mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300">
                View Full Login History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
