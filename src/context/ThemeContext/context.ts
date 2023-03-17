import { createContext } from 'react';
import { Themes } from './constants';

interface IThemeContext {
  currentTheme: Themes.Light | Themes.Dark;
  toggleTheme: () => void;
}

const ThemeContext = createContext<IThemeContext>();

export default ThemeContext;
