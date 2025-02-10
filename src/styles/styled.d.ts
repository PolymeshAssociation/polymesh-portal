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
      textPrimary: string;
      textSecondary: string;
      textBlue: string;
      textPink: string;
      textPurple: string;
      textDisabled: string;
      textSuccess: string;
      lightAccent: string;
      shadow: string;
      backdrop: string;
      skeletonBase: string;
      skeletonHighlight: string;
      error: string;
      focusBorder: string;
      buttonBackground: string;
      buttonHoverBackground: string;
      buttonText: string;
      hoverBackground: string;
      border: string;
    };
    borderRadius: {
      small: string;
      medium: string;
    };
    spacing: (multiplier: number) => string;
  }
}
