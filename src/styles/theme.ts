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
    disabledBackground: '#F0F0F0',
    pinkBackground: '#FFEBF1',
    successBackground: '#D4F7E7',
    textPrimary: '#1E1E1E',
    textSecondary: '#727272',
    textBlue: '#170087',
    textPink: '#FF2E72',
    textSuccess: '#00AA5E',
    textDisabled: '#c7c7c7',
    lightAccent: '#F0F0F0',
    shadow: 'rgba(30, 30, 30, 0.1)',
    backdrop: 'rgba(21, 41, 53, 0.3)',
  },
} as DefaultTheme;

const dark = {
  ...common,
  colors: {
    landingBackground: '#3A3A3A',
    dashboardBackground: '#1E1E1E',
    modalBackground: '#3A3A3A',
    disabledBackground: 'transparent',
    pinkBackground: '#97266D',
    successBackground: '#00AA5E',
    textPrimary: '#FBFBFB',
    textSecondary: '#C7C7C7;',
    textBlue: '#DCD3FF',
    textPink: '#FAD1DC',
    textSuccess: '#D4F7E7',
    textDisabled: '#565656',
    lightAccent: '#3A3A3A',
    shadow: 'rgba(120, 120, 120, 0.1)',
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
  color: ${({ theme: styledTheme }) => styledTheme.colors.textPrimary};
  }

 input {
  color: ${({ theme: styledTheme }) => styledTheme.colors.textPrimary};
 } 
`;
