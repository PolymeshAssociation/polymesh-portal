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
      textPrimary: string;
      textSecondary: string;
    };
  }
}
