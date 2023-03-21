import { DefaultTheme } from 'styled-components';

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
  },
} as DefaultTheme;

const dark = {
  ...common,
  colors: {
    landingBackground: '#FFFFFF',
    dashboardBackground: '#F5F5F5',
    modalBackground: '#FFFFFF',
    textPrimary: '#1E1E1E',
    textSecondary: '#727272',
  },
} as DefaultTheme;

const theme = {
  light,
  dark,
};

export default theme;
