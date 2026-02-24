// src/components/settings/SecuritySettings.tsx
import { FC, useState } from 'react';

import { CheckCircle, Key, Loader2, Shield } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';

const SecuritySettings: FC = () => {
  const { changePassword } = useAuth();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }

    setPwSaving(true);
    try {
      await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess(true);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setPwSuccess(false);
        setShowChangePassword(false);
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password.';
      setPwError(msg);
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Manage your account security settings.
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
                Keep your account secure with a strong password.
              </p>

              {!showChangePassword ? (
                <button
                  onClick={() => {
                    setShowChangePassword(true);
                    setPwError(null);
                    setPwSuccess(false);
                  }}
                  className="mt-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={pwForm.currentPassword}
                      onChange={handlePwChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={pwForm.newPassword}
                      onChange={handlePwChange}
                      required
                      minLength={8}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter new password (min 8 chars)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={pwForm.confirmPassword}
                      onChange={handlePwChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {pwError && <p className="text-sm text-red-600 dark:text-red-400">{pwError}</p>}
                  {pwSuccess && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle size={16} /> Password changed successfully.
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={pwSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-60"
                    >
                      {pwSaving && <Loader2 size={14} className="animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-start">
            <div className="mr-4 p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
              <Shield size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium dark:text-gray-100">Active Session</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You are currently logged in. Your session is protected by a JWT token.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
