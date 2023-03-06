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
    textPrimary: '#1E1E1E',
    textSecondary: '#727272',
  },
};

const dark = {
  ...common,
  colors: {
    landingBackground: '#FFFFFF',
  },
};

const theme = {
  light,
  dark,
};

export default theme;
