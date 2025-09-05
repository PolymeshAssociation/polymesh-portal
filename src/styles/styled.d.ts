import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    mode: string;
    textSize: {
      large: string;
      medium: string;
      small: string;
    };
    colors: {
      landingBackground: string;
      dashboardBackground: string;
      modalBackground: string;
      disabledBackground: string;
      pinkBackground: string;
      successBackground: string;
      warningBackground: string;
      errorBackground: string;
      textPrimary: string;
      textSecondary: string;
      textBlue: string;
      textPink: string;
      textPurple: string;
      textDisabled: string;
      textSuccess: string;
      textWarning: string;
      lightAccent: string;
      shadow: string;
      backdrop: string;
      skeletonBase: string;
      skeletonHighlight: string;
      error: string;
      warning: string;
      success: string;
      info: string;
      focusBorder: string;
      buttonBackground: string;
      buttonHoverBackground: string;
      buttonText: string;
      hoverBackground: string;
      border: string;
      inputBorder: string;
      cardBackground: string;
      shadeBackground: string;
      mediumGrayText: string;
      lightGrayBorder: string;
    };
    borderRadius: {
      small: string;
      medium: string;
      large: string;
    };
    spacing: (multiplier: number) => string;
    boxShadow: {
      small: string;
      medium: string;
      large: string;
      xl: string;
    };
    transition: {
      fast: string;
      normal: string;
      slow: string;
    };
  }
}
