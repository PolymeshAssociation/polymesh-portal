import { useContext } from 'react';
import { ThemeContext } from '~/context/ThemeContext';
import { Icon } from '~/components';
import {
  HiddenInput,
  StyledCheckboxMark,
  StyledCheckboxWrapper,
  StyledWrapper,
} from './styles';

export const ThemeToggle = () => {
  const { currentTheme, toggleTheme } = useContext(ThemeContext);
  const isLight = currentTheme === 'light';
  return (
    <StyledWrapper>
      {currentTheme}
      <StyledCheckboxWrapper isLight={isLight} htmlFor="theme-toggle">
        <HiddenInput
          type="checkbox"
          id="theme-toggle"
          onChange={() => toggleTheme()}
        />
        <StyledCheckboxMark isLight={isLight}>
          <Icon
            name={isLight ? 'LightMode' : 'DarkMode'}
            size="12px"
            className={`icon ${isLight ? 'light' : 'dark'}`}
          />
        </StyledCheckboxMark>
      </StyledCheckboxWrapper>
    </StyledWrapper>
  );
};
