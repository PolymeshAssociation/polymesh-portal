/**
 * Cookiebot utility functions for dynamic script loading
 */

import { Themes } from '../context/ThemeContext/constants';
import {
  getSystemTheme,
  isSystemThemeEnabled,
} from '../context/ThemeContext/provider';
import { theme as appTheme } from '../styles/theme';
import { setCookiebotThemeProperties } from './cookiebotTheme';

/**
 * Check if Cookiebot is enabled from environment variable
 * Handles both boolean and string values, similar to isProviderEnabled pattern
 */
export const isCookiebotEnabled = (envVar: string | undefined): boolean => {
  return envVar?.toLowerCase() === 'true';
};

/**
 * Safely get item from localStorage with error handling
 */
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(`Failed to read '${key}' from localStorage:`, error);
    }
    return null;
  }
};

/**
 * Get the current theme using the centralized ThemeContext logic
 */
const getCurrentTheme = (): 'light' | 'dark' => {
  if (isSystemThemeEnabled()) {
    const systemTheme = getSystemTheme();
    return systemTheme === Themes.Dark ? 'dark' : 'light';
  }

  // Use manually selected theme from localStorage
  const themeFromLs = getLocalStorageItem('theme');
  return (themeFromLs as 'light' | 'dark') || 'light';
};

/**
 * Apply theme styles to Cookiebot banner elements
 */
const applyBannerTheme = (theme: 'light' | 'dark') => {
  const bannerElement = document.querySelector('#CybotCookiebotDialog');

  if (bannerElement) {
    if (theme === 'dark') {
      // Set theme data attribute and apply dark theme properties
      bannerElement.setAttribute('data-theme', 'dark');
      setCookiebotThemeProperties(appTheme.dark);
    } else {
      // Set theme data attribute and apply light theme properties
      bannerElement.setAttribute('data-theme', 'light');
      setCookiebotThemeProperties(appTheme.light);
    }
  }
};

/**
 * Set up Cookiebot script loaded callback and theme integration
 */
const setupCookiebotTheming = () => {
  // listen for when the dialog is displayed
  window.addEventListener('CookiebotOnDialogDisplay', () => {
    applyBannerTheme(getCurrentTheme());
  });
};

/**
 * Watch for theme changes and update banner styling
 */
const watchThemeChanges = () => {
  // Listen for localStorage changes (theme updates from other tabs/windows)
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme' || e.key === 'useSystemTheme') {
      applyBannerTheme(getCurrentTheme());
    }
  });

  // Listen for system theme changes (when useSystemTheme is enabled)
  const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
  darkThemeMq.addEventListener('change', () => {
    const systemThemeEnabled = getLocalStorageItem('useSystemTheme') === 'true';
    if (systemThemeEnabled) {
      applyBannerTheme(getCurrentTheme());
    }
  });

  // Also listen for direct localStorage changes in the same tab
  // IMPORTANT: The native 'storage' event only fires in other tabs/windows, not the one that
  // made the change. To ensure the banner's theme updates instantly when changed from the
  // app's UI in the same tab, we wrap setItem to trigger the theme update manually.
  //
  // This monkey-patching approach is necessary because:
  // 1. Storage events don't fire in the originating tab (browser limitation)
  // 2. We need immediate theme updates when users toggle themes
  // 3. There's no standard way to listen for localStorage changes in the same tab
  //
  // WARNING: This modifies the native localStorage.setItem function. Future developers
  // should not remove this without understanding that it will break same-tab theme updates
  // for the Cookiebot banner.
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function setItem(key: string, value: string) {
    originalSetItem.apply(this, [key, value]);
    if (key === 'theme' || key === 'useSystemTheme') {
      applyBannerTheme(getCurrentTheme());
    }
  };
};

/**
 * Loads the Cookiebot consent script dynamically with theme support
 */
export const loadCookiebotScript = (): void => {
  const cookiebotId = import.meta.env.VITE_COOKIEBOT_ID;
  const cookiebotEnabled = isCookiebotEnabled(
    import.meta.env.VITE_COOKIEBOT_ENABLED ?? 'false',
  );
  const cookiebotGeoRegions = import.meta.env.VITE_COOKIEBOT_GEOREGIONS;

  // Skip loading if Cookiebot is disabled or ID is not set
  if (
    !cookiebotEnabled ||
    !cookiebotId ||
    cookiebotId === 'VITE_COOKIEBOT_ID_NOT_SET' ||
    !/^[a-zA-Z0-9-]+$/.test(cookiebotId)
  ) {
    return;
  }

  // Skip if script is already loaded
  if (document.getElementById('Cookiebot')) {
    return;
  }

  // Set up banner theme watching (before script loads)
  setupCookiebotTheming();
  watchThemeChanges();

  const script = document.createElement('script');
  script.id = 'Cookiebot';
  script.src = 'https://consent.cookiebot.com/uc.js';
  script.setAttribute('data-cbid', cookiebotId);
  // Use 'auto' blocking mode - Cookiebot automatically detects and blocks
  // non-essential cookies/scripts until user gives consent. This provides
  // automatic compliance but may occasionally block legitimate scripts.
  // Alternative modes: 'manual' (requires explicit configuration in admin panel)
  script.setAttribute('data-blockingmode', 'auto');

  // Add geo-regions support if configured
  // Format: "{'region':'US-06','cbid':'123'},{'region':'BR','cbid':'456'}"
  if (cookiebotGeoRegions && cookiebotGeoRegions.trim() !== '') {
    script.setAttribute('data-georegions', cookiebotGeoRegions);
  }

  script.type = 'text/javascript';
  script.async = true;

  document.head.appendChild(script);
};
