/**
 * Shared utility functions for managing Cookiebot theme CSS custom properties
 */

import type { DefaultTheme } from 'styled-components';

// Reusable style element for better performance
let cookiebotStyleElement: HTMLStyleElement | null = null;

/**
 * Inject CSS rules to apply button-specific variables to Cookiebot buttons.
 *
 * Why this high-specificity approach is necessary:
 * - Cookiebot's default CSS uses ID selectors with !important declarations
 * - There is no official API to disable Cookiebot's built-in styling
 * - We need to override their styles to match our application's theme system
 * - These selectors must match or exceed Cookiebot's specificity to take effect
 *
 * Warning: These selectors are brittle and may break if Cookiebot changes their HTML structure.
 * However, this is currently the only reliable way to integrate Cookiebot with custom themes.
 */
const applyCookiebotButtonStyles = (): void => {
  // Create style element only once for better performance
  if (!cookiebotStyleElement) {
    cookiebotStyleElement = document.createElement('style');
    cookiebotStyleElement.id = 'cookiebot-button-overrides';
    document.head.appendChild(cookiebotStyleElement);
  }

  // Update content instead of recreating the element
  cookiebotStyleElement.textContent = `
    /* Cookiebot button-specific styling with maximum specificity */
    /* These selectors are intentionally verbose to override Cookiebot's default styles */
    #CybotCookiebotDialog #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll.CybotCookiebotDialogBodyButton {
      background-color: var(--cookiebot-button1-bg) !important;
      color: var(--cookiebot-button1-text) !important;
      border: 2px solid var(--cookiebot-button1-border) !important;
    }
    
    #CybotCookiebotDialog #CybotCookiebotDialogBodyLevelButtonCustomize.CybotCookiebotDialogBodyButton,
    #CybotCookiebotDialog #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection.CybotCookiebotDialogBodyButton {
      background-color: var(--cookiebot-button2-bg) !important;
      color: var(--cookiebot-button2-text) !important;
      border: 2px solid var(--cookiebot-button2-border) !important;
    }
    
    #CybotCookiebotDialog #CybotCookiebotDialogBodyButtonDecline.CybotCookiebotDialogBodyButton {
      background-color: var(--cookiebot-button3-bg) !important;
      color: var(--cookiebot-button3-text) !important;
      border: 2px solid var(--cookiebot-button3-border) !important;
    }
    
    /* Fix scrollbar containers in dark theme */
    #CybotCookiebotDialog .CybotCookiebotScrollbarContainer {
      background-color: var(--cookiebot-scrollbar-bg) !important;
    }
    
    /* Fix arrow borders in dark theme */
    #CybotCookiebotDialog .CybotCookiebotDialogArrow {
      border-color: var(--cookiebot-border-color) !important;
    }
  `;
};

/**
 * Set CSS custom properties for Cookiebot components using theme colors
 */
export const setCookiebotThemeProperties = (theme: DefaultTheme): void => {
  const root = document.documentElement;
  const { colors } = theme;

  // Set CSS custom properties using actual theme values
  root.style.setProperty('--cookiebot-bg-color', colors.dashboardBackground);
  root.style.setProperty('--cookiebot-card-bg-color', colors.cardBackground);
  root.style.setProperty('--cookiebot-modal-bg', colors.modalBackground);
  root.style.setProperty('--cookiebot-text-primary', colors.textPrimary);
  root.style.setProperty('--cookiebot-text-secondary', colors.textSecondary);
  root.style.setProperty('--cookiebot-border-color', colors.border);
  root.style.setProperty('--cookiebot-border', colors.border);
  root.style.setProperty('--cookiebot-input-border', colors.inputBorder);
  root.style.setProperty('--cookiebot-shadow-color', colors.shadow);
  root.style.setProperty('--cookiebot-hover-bg', colors.hoverBackground);
  root.style.setProperty('--cookiebot-row-alt-bg', colors.hoverBackground);
  root.style.setProperty('--cookiebot-button-bg', colors.buttonBackground);
  root.style.setProperty(
    '--cookiebot-button-hover-bg',
    colors.buttonHoverBackground,
  );
  root.style.setProperty('--cookiebot-button-text', colors.textPink);
  root.style.setProperty('--cookiebot-code-bg', colors.hoverBackground);
  root.style.setProperty('--cookiebot-code-border', colors.border);
  root.style.setProperty('--cookiebot-tag-bg', colors.hoverBackground);
  root.style.setProperty('--cookiebot-pink-bg', colors.pinkBackground);
  root.style.setProperty('--cookiebot-success-bg', colors.successBackground);
  root.style.setProperty('--cookiebot-warning-bg', colors.warningBackground);
  root.style.setProperty('--cookiebot-error-bg', colors.errorBackground);
  root.style.setProperty('--cookiebot-focus-border', colors.focusBorder);
  root.style.setProperty('--cookiebot-scrollbar-bg', colors.cardBackground);

  // Button-specific CSS variables for precise control
  // Common properties across both themes (theme object handles color differences)
  root.style.setProperty('--cookiebot-button1-bg', colors.textPink);
  root.style.setProperty('--cookiebot-button1-border', colors.textPink);
  root.style.setProperty('--cookiebot-button2-text', colors.textPink);
  root.style.setProperty('--cookiebot-button2-border', colors.textPink);
  root.style.setProperty('--cookiebot-button3-bg', colors.shadeBackground);
  root.style.setProperty('--cookiebot-button3-text', colors.mediumGrayText);
  root.style.setProperty('--cookiebot-button3-border', colors.lightGrayBorder);

  // Only these properties actually differ between themes
  const isDarkTheme = theme.mode === 'dark';
  if (isDarkTheme) {
    // Dark theme: Dark text on light pink background for button 1
    root.style.setProperty(
      '--cookiebot-button1-text',
      colors.dashboardBackground,
    );
    // Slightly lighter background for button 2
    root.style.setProperty('--cookiebot-button2-bg', colors.lightAccent);
  } else {
    // Light theme: White text on pink background for button 1
    root.style.setProperty('--cookiebot-button1-text', colors.buttonText);
    // White background for button 2
    root.style.setProperty(
      '--cookiebot-button2-bg',
      colors.dashboardBackground,
    );
  }

  // Apply button-specific CSS rules to override Cookiebot's default styling
  applyCookiebotButtonStyles();
};
