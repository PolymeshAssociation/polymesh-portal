import { useEffect, useState } from 'react';
import ThemeContext from './context';
import { Themes } from './constants';

const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');

const getInitialTheme = () => {
  const themeFromLs = localStorage.getItem('theme') || null;

  if (!themeFromLs) {
    const isDarkTheme = darkThemeMq.matches;
    return isDarkTheme ? Themes.Dark : Themes.Light;
  }

  return Themes.Light;
};

interface IAppThemeProps {
  children: React.ReactNode;
}

const AppThemeProvider = ({ children }: IAppThemeProps) => {
  const [currentTheme, setCurrentTheme] = useState(getInitialTheme);

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
    <ThemeContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{ currentTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default AppThemeProvider;
