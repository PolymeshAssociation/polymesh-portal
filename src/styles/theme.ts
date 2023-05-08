import { DefaultTheme, createGlobalStyle } from 'styled-components';

const common = {
  textSize: {
    large: '16px',
    medium: '14px',
    small: '12px',
  },
};

const light = {
  ...common,
  colors: {
    landingBackground: '#FFFFFF',
    dashboardBackground: '#F5F5F5',
    modalBackground: '#FFFFFF',
    textPrimary: '#1E1E1E',
    textSecondary: '#727272',
    textBlue: '#170087',
    shadow: 'rgba(30, 30, 30, 0.15)',
    backdrop: 'rgba(21, 41, 53, 0.3)',
  },
} as DefaultTheme;

const dark = {
  ...common,
  colors: {
    landingBackground: '#1E1E1E',
    dashboardBackground: '#000000',
    modalBackground: '#1E1E1E',
    textPrimary: '#FFFFFF',
    textSecondary: '#727272',
    textBlue: '#DCD3FF',
    shadow: 'rgba(120, 120, 120, 0.15)',
    // backdrop: 'rgba(209, 194, 182, 0.1)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
} as DefaultTheme;

export const theme = {
  light,
  dark,
};

export const GlobalStyle = createGlobalStyle`
body {
    background-color: ${({ theme: styledTheme }) =>
      styledTheme.colors.landingBackground};
  }

 input {
  color: ${({ theme: styledTheme }) => styledTheme.colors.textPrimary};
 } 
`;
