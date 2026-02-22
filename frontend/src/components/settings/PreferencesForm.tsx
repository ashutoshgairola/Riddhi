// src/components/settings/PreferencesForm.tsx
import { FC, useEffect, useState } from 'react';

import { CheckCircle, Loader2 } from 'lucide-react';

import { useSettings } from '../../contexts/SettingsContext';
import { UserPreferencesDTO } from '../../types/settings.types';

const CURRENCIES = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
];

const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

const PreferencesForm: FC = () => {
  const { userPreferences, updateUserPreferences, isLoading } = useSettings();

  const [form, setForm] = useState<UserPreferencesDTO>(userPreferences);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep form in sync with context (initial load)
  useEffect(() => {
    setForm(userPreferences);
  }, [userPreferences]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTheme = (theme: 'light' | 'dark' | 'system') => {
    setForm((prev) => ({ ...prev, theme }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateUserPreferences(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500';

  if (isLoading && !userPreferences.currency) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 size={24} className="animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Currency */}
        <div>
          <h3 className="text-lg font-medium dark:text-gray-100 mb-3">Currency</h3>
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className={inputCls}
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Format */}
        <div>
          <h3 className="text-lg font-medium dark:text-gray-100 mb-3">Date Format</h3>
          <select
            name="dateFormat"
            value={form.dateFormat}
            onChange={handleChange}
            className={inputCls}
          >
            {DATE_FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Theme */}
        <div>
          <h3 className="text-lg font-medium dark:text-gray-100 mb-3">Theme</h3>
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTheme(t)}
                className={`border rounded-lg p-2 cursor-pointer transition-colors ${
                  form.theme === t
                    ? 'border-green-500 ring-2 ring-green-300 dark:ring-green-700'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div
                  className={`h-16 rounded mb-2 ${
                    t === 'light'
                      ? 'bg-white border border-gray-100'
                      : t === 'dark'
                        ? 'bg-gray-800'
                        : 'bg-gradient-to-b from-white to-gray-800'
                  }`}
                />
                <p className="text-center text-sm capitalize dark:text-gray-300">{t}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Start of Week */}
        <div>
          <h3 className="text-lg font-medium dark:text-gray-100 mb-3">Start of Week</h3>
          <select
            name="startOfWeek"
            value={form.startOfWeek}
            onChange={handleChange}
            className={inputCls}
          >
            <option value="sunday">Sunday</option>
            <option value="monday">Monday</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <h3 className="text-lg font-medium dark:text-gray-100 mb-3">Language</h3>
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
            className={inputCls}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Feedback */}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {success && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle size={16} /> Preferences saved successfully.
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save Preferences
          </button>
        </div>
      </div>
    </form>
  );
};

export default PreferencesForm;
