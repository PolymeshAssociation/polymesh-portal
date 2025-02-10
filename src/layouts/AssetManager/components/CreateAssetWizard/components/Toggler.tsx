import React from 'react';
import styled from 'styled-components';

interface TogglerProps {
  id: string;
  isEnabled: boolean;
  handleChange: (state: boolean) => void;
}

const StyledCheckboxWrapper = styled.label<{ $isEnabled: boolean }>`
  position: relative;
  display: block;
  width: 48px;
  height: 24px;
  background-color: ${({ $isEnabled, theme }) =>
    $isEnabled ? theme.colors.textPink : theme.colors.dashboardBackground};
  border: 1px solid
    ${({ theme, $isEnabled }) =>
      $isEnabled ? 'transparent' : theme.colors.textSecondary};
  border-radius: 12px;
  cursor: pointer;
  transition: all 250ms ease-out;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPink};
    background-color: ${({ $isEnabled, theme }) =>
      $isEnabled ? theme.colors.textPink : theme.colors.pinkBackground};
  }

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${({ $isEnabled }) => ($isEnabled ? '27px' : '3px')};
    display: block;
    width: 16px;
    height: 16px;
    background-color: ${({ theme, $isEnabled }) =>
      $isEnabled ? theme.colors.landingBackground : theme.colors.textSecondary};
    border-radius: 50%;
    box-shadow: 0px 1px 3px ${({ theme }) => theme.colors.shadow};
    transition: all 250ms ease-out;
  }

  &:hover::after {
    background-color: ${({ theme, $isEnabled }) =>
      $isEnabled ? theme.colors.landingBackground : theme.colors.textPink};
  }
`;

const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  border: 0;
  padding: 0;
  white-space: nowrap;
  clip-path: inset(100%);
  clip: rect(0 0 0 0);
  overflow: hidden;
`;

const Toggler: React.FC<TogglerProps> = ({ id, isEnabled, handleChange }) => {
  return (
    <StyledCheckboxWrapper htmlFor={id} $isEnabled={isEnabled}>
      <HiddenInput
        type="checkbox"
        id={id}
        checked={isEnabled}
        onChange={({ target }) => handleChange(target.checked)}
      />
    </StyledCheckboxWrapper>
  );
};

export default Toggler;
