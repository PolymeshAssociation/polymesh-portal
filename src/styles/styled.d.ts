import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
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
      textDisabled: string;
      textSuccess: string;
      lightAccent: string;
      shadow: string;
      backdrop: string;
    };
  }
}
