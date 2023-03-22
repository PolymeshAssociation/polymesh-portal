export enum Themes {
  Light = 'light',
  Dark = 'dark',
}

export const initialValues = {
  currentTheme: Themes.Light,
  toggleTheme: () => {},
};
