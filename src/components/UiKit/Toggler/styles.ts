import styled from 'styled-components';

export const StyledCheckboxWrapper = styled.label<{ $isEnabled: boolean }>`
  position: relative;
  display: block;
  width: 48px;
  height: 24px;
  background-color: ${({ $isEnabled }) => ($isEnabled ? '#00AA5E' : '#565656')};
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 250ms ease-out;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${({ $isEnabled }) => ($isEnabled ? '27px' : '3px')};
    display: block;
    width: 18px;
    height: 18px;
    background-color: #ffffff;
    border-radius: 50%;
    box-shadow: 0px 1px 3px rgba(30, 30, 30, 0.12),
      0px 1px 2px rgba(30, 30, 30, 0.24);
    transition: left 250ms ease-out;
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
