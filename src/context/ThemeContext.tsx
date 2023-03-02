import { createContext, useEffect, useState } from 'react';

export enum Themes {
  Light = 'light',
  Dark = 'dark',
}

interface IThemeContext {
  currentTheme: Themes.Light | Themes.Dark;
  toggleTheme: () => void;
}

const readThemeFromLS = () => localStorage.getItem('theme') || Themes.Light;

export const ThemeContext = createContext<IThemeContext>();

export const AppThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(readThemeFromLS);

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    switch (currentTheme) {
      case Themes.Light:
        setCurrentTheme(Themes.Dark);
        break;
      case Themes.Dark:
        setCurrentTheme(Themes.Light);
        break;
      default:
        break;
    }
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <ThemeContext.Provider value={{ currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
