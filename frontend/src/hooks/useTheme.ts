// src/hooks/useTheme.ts
import { useEffect, useMemo } from 'react';

import { useSettings } from '../contexts/SettingsContext';

export const useTheme = () => {
  const { userPreferences, updateUserPreferences } = useSettings();

  // Get current effective theme (resolves 'system' to 'light' or 'dark')
  const currentTheme = useMemo((): 'light' | 'dark' => {
    if (userPreferences.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return userPreferences.theme;
  }, [userPreferences.theme]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    const body = document.body;

    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      body.classList.remove('bg-gray-50', 'bg-gray-900', 'text-gray-900', 'text-gray-100');

      const effectiveTheme: 'light' | 'dark' =
        theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : theme;

      root.classList.add(effectiveTheme);

      if (effectiveTheme === 'light') {
        root.style.colorScheme = 'light';
        body.classList.add('bg-gray-50', 'text-gray-900');
        body.classList.remove('bg-gray-900', 'text-gray-100');
        body.style.setProperty('background-color', '#f9fafb', 'important');
        body.style.setProperty('color', '#111827', 'important');
        root.style.setProperty('background-color', '#f9fafb', 'important');
      } else {
        root.style.colorScheme = 'dark';
        body.classList.add('bg-gray-900', 'text-gray-100');
        body.classList.remove('bg-gray-50', 'text-gray-900');
        body.style.setProperty('background-color', '#111827', 'important');
        body.style.setProperty('color', '#f3f4f6', 'important');
        root.style.setProperty('background-color', '#111827', 'important');
      }
    };

    applyTheme(userPreferences.theme);

    // Listen for system theme changes if using system theme
    if (userPreferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = () => {
        applyTheme('system');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [userPreferences.theme]);

  // Toggle between light and dark (preserves system if currently selected)
  const toggleTheme = async () => {
    const currentTheme = userPreferences.theme;
    let newTheme: 'light' | 'dark' | 'system';

    if (currentTheme === 'light') {
      newTheme = 'dark';
    } else if (currentTheme === 'dark') {
      newTheme = 'light';
    } else {
      // If system, toggle to the opposite of current system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      newTheme = systemPrefersDark ? 'light' : 'dark';
    }

    await updateUserPreferences({ theme: newTheme });
  };

  // Set specific theme
  const setTheme = async (theme: 'light' | 'dark' | 'system') => {
    await updateUserPreferences({ theme });
  };

  return {
    theme: userPreferences.theme,
    currentTheme,
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light',
    toggleTheme,
    setTheme,
  };
};
