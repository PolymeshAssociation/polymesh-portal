import { DefaultTheme, createGlobalStyle } from 'styled-components';

const common = {
  textSize: {
    large: '16px',
    medium: '14px',
    small: '12px',
  },
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '24px',
  },
  spacing: (multiplier: number) => `${multiplier * 8}px`,
  boxShadow: {
    small: '0px 2px 4px',
    medium: '0px 4px 8px',
    large: '0px 8px 16px',
    xl: '0px 20px 40px',
  },
  transition: {
    fast: '150ms ease-out',
    normal: '250ms ease-out',
    slow: '300ms ease-out',
  },
};

const commonTheme = {
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '24px',
  },
};

const light = {
  ...common,
  ...commonTheme,
  mode: 'light',
  colors: {
    landingBackground: '#FFFFFF',
    dashboardBackground: '#F5F5F5',
    modalBackground: '#FFFFFF',
    disabledBackground: '#F0F0F0',
    pinkBackground: '#FFEBF1',
    successBackground: '#D4F7E7',
    warningBackground: '#FFF3CD',
    errorBackground: '#F8D7DA',
    textPrimary: '#1E1E1E',
    textSecondary: '#727272',
    textBlue: '#170087',
    textPink: '#FF2E72',
    textPurple: '#43195B',
    textSuccess: '#00AA5E',
    textWarning: '#E3A30C',
    textDisabled: '#c7c7c7',
    lightAccent: '#e8e8e8',
    shadow: 'rgba(30, 30, 30, 0.1)',
    backdrop: 'rgba(21, 41, 53, 0.3)',
    skeletonBase: '#ebebeb',
    skeletonHighlight: '#f5f5f5',
    error: '#db2c3e',
    warning: '#E3A30C',
    success: '#00AA5E',
    info: '#170087',
    focusBorder: '#FF2E72',
    buttonBackground: '#FFEBF1',
    buttonHoverBackground: '#FF2E72',
    buttonText: '#FFFFFF',
    hoverBackground: 'rgba(0, 0, 0, 0.05)',
    border: '#E0E0E0',
    inputBorder: '#8f8f8f',
    cardBackground: '#FFFFFF',
  },
} as DefaultTheme;

const dark = {
  ...common,
  ...commonTheme,
  mode: 'dark',
  colors: {
    landingBackground: '#3A3A3A',
    dashboardBackground: '#1E1E1E',
    modalBackground: '#3A3A3A',
    disabledBackground: 'transparent',
    pinkBackground: '#97266D',
    successBackground: '#00AA5E',
    warningBackground: '#FBF3D0',
    errorBackground: '#F5C6CB',
    textPrimary: '#FBFBFB',
    textSecondary: '#C7C7C7;',
    textBlue: '#DCD3FF',
    textPink: '#FAD1DC',
    textPurple: '#97266D',
    textSuccess: '#D4F7E7',
    textWarning: '#F4D03F',
    textDisabled: '#565656',
    lightAccent: '#3A3A3A',
    shadow: 'rgba(120, 120, 120, 0.1)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    skeletonBase: '#484848',
    skeletonHighlight: '#727272',
    error: '#db2c3e',
    warning: '#F4D03F',
    success: '#00AA5E',
    info: '#DCD3FF',
    focusBorder: '#97266D',
    buttonBackground: '#97266D',
    buttonHoverBackground: '#FAD1DC',
    buttonText: '#FFFFFF',
    hoverBackground: 'rgba(255, 255, 255, 0.05)',
    border: '#666666',
    inputBorder: '#565656',
    cardBackground: '#3A3A3A',
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
