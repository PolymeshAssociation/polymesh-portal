import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  text-transform: capitalize;
`;

export const StyledCheckboxWrapper = styled.label<{ isLight: boolean }>`
  position: relative;
  display: block;
  width: 48px;
  height: 24px;
  background-color: ${({ isLight }) => (isLight ? '#FF2E72' : 'transparent')};
  border: 1px solid #ff2e72;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 250ms ease-out;
`;

export const StyledCheckboxMark = styled.span<{ isLight: boolean }>`
  position: absolute;
  top: 3px;
  left: ${({ isLight }) => (isLight ? '27px' : '3px')};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background-color: ${({ isLight }) => (isLight ? '#ffffff' : '#FF2E72')};
  border-radius: 50%;
  box-shadow: ${({ theme }) => `0px 1px 3px ${theme.colors.shadow},
    0px 1px 2px ${theme.colors.shadow}`};
  transition: background-color 250ms ease-out, left 250ms ease-out;

  & .icon {
    transition: color 250ms ease-out;
  }

  & .icon.dark {
    color: ${({ isLight }) => (isLight ? 'transparent' : '#ffffff')};
  }
  & .icon.light {
    color: ${({ isLight }) => (isLight ? '#FF2E72' : 'transparent')};
  }
`;

export const HiddenInput = styled.input`
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
