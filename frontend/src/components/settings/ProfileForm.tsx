// src/components/settings/ProfileForm.tsx
import { FC, useEffect, useState } from 'react';

import { CheckCircle, Loader2 } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/api/authService';
import { UpdateProfileDTO } from '../../types/auth.types';

interface CountryCode {
  name: string;
  flag: string;
  dial: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { name: 'India', flag: '🇮🇳', dial: '+91' },
  { name: 'United States', flag: '🇺🇸', dial: '+1' },
  { name: 'United Kingdom', flag: '🇬🇧', dial: '+44' },
  { name: 'Australia', flag: '🇦🇺', dial: '+61' },
  { name: 'Canada', flag: '🇨🇦', dial: '+1' },
  { name: 'China', flag: '🇨🇳', dial: '+86' },
  { name: 'Japan', flag: '🇯🇵', dial: '+81' },
  { name: 'Germany', flag: '🇩🇪', dial: '+49' },
  { name: 'France', flag: '🇫🇷', dial: '+33' },
  { name: 'Brazil', flag: '🇧🇷', dial: '+55' },
  { name: 'Mexico', flag: '🇲🇽', dial: '+52' },
  { name: 'South Africa', flag: '🇿🇦', dial: '+27' },
  { name: 'Nigeria', flag: '🇳🇬', dial: '+234' },
  { name: 'United Arab Emirates', flag: '🇦🇪', dial: '+971' },
  { name: 'Singapore', flag: '🇸🇬', dial: '+65' },
  { name: 'Pakistan', flag: '🇵🇰', dial: '+92' },
  { name: 'Bangladesh', flag: '🇧🇩', dial: '+880' },
  { name: 'Sri Lanka', flag: '🇱🇰', dial: '+94' },
  { name: 'Nepal', flag: '🇳🇵', dial: '+977' },
  { name: 'Indonesia', flag: '🇮🇩', dial: '+62' },
  { name: 'Malaysia', flag: '🇲🇾', dial: '+60' },
  { name: 'Philippines', flag: '🇵🇭', dial: '+63' },
  { name: 'South Korea', flag: '🇰🇷', dial: '+82' },
  { name: 'Italy', flag: '🇮🇹', dial: '+39' },
  { name: 'Spain', flag: '🇪🇸', dial: '+34' },
  { name: 'Netherlands', flag: '🇳🇱', dial: '+31' },
  { name: 'Sweden', flag: '🇸🇪', dial: '+46' },
  { name: 'Norway', flag: '🇳🇴', dial: '+47' },
  { name: 'Switzerland', flag: '🇨🇭', dial: '+41' },
  { name: 'Russia', flag: '🇷🇺', dial: '+7' },
  { name: 'Turkey', flag: '🇹🇷', dial: '+90' },
  { name: 'Saudi Arabia', flag: '🇸🇦', dial: '+966' },
  { name: 'Egypt', flag: '🇪🇬', dial: '+20' },
  { name: 'Kenya', flag: '🇰🇪', dial: '+254' },
  { name: 'Argentina', flag: '🇦🇷', dial: '+54' },
  { name: 'New Zealand', flag: '🇳🇿', dial: '+64' },
];

/** Split a stored phone like "+91 9876543210" into dial + local parts */
const splitPhone = (phone: string): { dial: string; local: string } => {
  if (!phone) return { dial: '+91', local: '' };
  const match = phone.match(/^(\+\d+)\s*(.*)/);
  if (match) {
    const found = COUNTRY_CODES.find((c) => c.dial === match[1]);
    return found ? { dial: match[1], local: match[2] } : { dial: '+91', local: phone };
  }
  return { dial: '+91', local: phone };
};

const ProfileForm: FC = () => {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState<UpdateProfileDTO & { email: string }>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [dialCode, setDialCode] = useState('+91');
  const [localPhone, setLocalPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const { dial, local } = splitPhone(user.phone ?? '');
      setDialCode(dial);
      setLocalPhone(local);
      setForm({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phone: user.phone ?? '',
        email: user.email ?? '',
      });
    } else {
      authService
        .getProfile()
        .then((res) => {
          const u = res.data;
          const { dial, local } = splitPhone(u.phone ?? '');
          setDialCode(dial);
          setLocalPhone(local);
          setForm({
            firstName: u.firstName,
            lastName: u.lastName,
            phone: u.phone ?? '',
            email: u.email,
          });
        })
        .catch(() => {});
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocalPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d\s\-()]/g, '');
    setLocalPhone(val);
  };

  const handleDialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDialCode(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    const combinedPhone = localPhone.trim() ? `${dialCode} ${localPhone.trim()}` : '';
    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: combinedPhone,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.firstName?.[0] ?? '') + (form.lastName?.[0] ?? '') || '?';

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500';

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6">
        {/* Avatar */}
        <div className="flex items-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-800 dark:text-green-300 text-2xl font-bold mr-4">
            {initials.toUpperCase()}
          </div>
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
        </div>

        {/* Phone + Email side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <div className="flex gap-2">
              {/* Country code dropdown */}
              <select
                value={dialCode}
                onChange={handleDialChange}
                className="shrink-0 px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={`${c.name}-${c.dial}`} value={c.dial}>
                    {c.flag} {c.dial}
                  </option>
                ))}
              </select>
              {/* Local number input */}
              <input
                type="tel"
                value={localPhone}
                onChange={handleLocalPhoneChange}
                placeholder="98765 43210"
                className={`${inputClass} min-w-0`}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Email address cannot be changed.
            </p>
          </div>
        </div>

        {/* Feedback */}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {success && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle size={16} />
            Profile updated successfully.
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
