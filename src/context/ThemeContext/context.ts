import { createContext } from 'react';
import { Themes, initialValues } from './constants';

interface IThemeContext {
  currentTheme: `${Themes}`;
  toggleTheme: () => void;
  systemThemeEnabled: boolean;
  toggleUseSystemTheme: () => void;
}

const ThemeContext = createContext<IThemeContext>(initialValues);

export default ThemeContext;
