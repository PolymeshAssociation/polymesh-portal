import { useEffect, useState, useMemo, useCallback } from 'react';
import ThemeContext from './context';
import { Themes } from './constants';

const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');

const isSystemThemeEnabled = (): boolean => {
  const systemThemeEnabled = localStorage.getItem('useSystemTheme');
  return systemThemeEnabled === 'true';
};

const getSystemTheme = (): Themes => {
  const isDarkTheme = darkThemeMq.matches;
  return isDarkTheme ? Themes.Dark : Themes.Light;
};

const getInitialTheme = (): Themes => {
  const themeFromLs = localStorage.getItem('theme') || null;

  if (isSystemThemeEnabled() || !themeFromLs) {
    localStorage.setItem('useSystemTheme', 'true');
    return getSystemTheme();
  }

  return themeFromLs as Themes;
};

interface IAppThemeProps {
  children: React.ReactNode;
}

const AppThemeProvider = ({ children }: IAppThemeProps) => {
  const [currentTheme, setCurrentTheme] = useState<Themes>(
    isSystemThemeEnabled() ? getSystemTheme() : getInitialTheme(),
  );
  const [systemThemeEnabled, setSystemThemeEnabled] = useState(
    isSystemThemeEnabled(),
  );

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('useSystemTheme', systemThemeEnabled.toString());
  }, [systemThemeEnabled]);

  useEffect(() => {
    const handleSystemThemeChange = () => {
      if (isSystemThemeEnabled()) {
        setCurrentTheme(getSystemTheme());
      }
    };

    darkThemeMq.addEventListener('change', handleSystemThemeChange);

    return () => {
      darkThemeMq.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setCurrentTheme((prevTheme) =>
      prevTheme === Themes.Light ? Themes.Dark : Themes.Light,
    );
    setSystemThemeEnabled(false);
  }, []);

  const toggleUseSystemTheme = useCallback(() => {
    setCurrentTheme((prevTheme) => {
      const updatedUseSystemTheme = !isSystemThemeEnabled();
      setSystemThemeEnabled(updatedUseSystemTheme);
      return updatedUseSystemTheme ? getSystemTheme() : prevTheme;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      currentTheme,
      toggleTheme,
      systemThemeEnabled,
      toggleUseSystemTheme,
    }),
    [currentTheme, toggleTheme, systemThemeEnabled, toggleUseSystemTheme],
  );

  return (
    <ThemeContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={contextValue}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default AppThemeProvider;
