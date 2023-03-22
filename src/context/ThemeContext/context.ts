import { createContext } from 'react';
import { Themes, initialValues } from './constants';

interface IThemeContext {
  currentTheme: `${Themes}`;
  toggleTheme: () => void;
}

const ThemeContext = createContext<IThemeContext>(initialValues);

export default ThemeContext;
