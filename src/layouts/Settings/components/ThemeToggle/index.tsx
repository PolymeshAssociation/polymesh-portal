import { useContext } from 'react';
import { ThemeContext } from '~/context/ThemeContext';
import { Icon } from '~/components';
import {
  HiddenInput,
  StyledCheckboxMark,
  StyledCheckboxWrapper,
  StyledWrapper,
  StyledSelect,
} from './styles';

export const ThemeToggle = () => {
  const {
    currentTheme,
    toggleTheme,
    systemThemeEnabled,
    toggleUseSystemTheme,
  } = useContext(ThemeContext);
  const isLight = currentTheme === 'light';

  const handleThemeCheckboxChange = () => {
    toggleTheme();
  };

  const handleSystemThemeCheckboxChange = () => {
    toggleUseSystemTheme();
  };

  return (
    <StyledWrapper>
      <div>
        System Default
        <StyledSelect
          $isSelected={systemThemeEnabled}
          onClick={handleSystemThemeCheckboxChange}
        >
          <Icon name="Check" size="16px" />
        </StyledSelect>
      </div>
      <div>
        {currentTheme}
        <StyledCheckboxWrapper $isLight={isLight} htmlFor="theme-toggle">
          <HiddenInput
            type="checkbox"
            id="theme-toggle"
            onChange={handleThemeCheckboxChange}
          />
          <StyledCheckboxMark $isLight={isLight}>
            <Icon
              name={isLight ? 'LightMode' : 'DarkMode'}
              size="12px"
              className={`icon ${isLight ? 'light' : 'dark'}`}
            />
          </StyledCheckboxMark>
        </StyledCheckboxWrapper>
      </div>
    </StyledWrapper>
  );
};
