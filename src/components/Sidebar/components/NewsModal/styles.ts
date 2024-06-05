import styled from 'styled-components';

export const StyledNewsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 648px;
  & > .subscribe-btn {
    width: 'fit-content';
    margin-left: auto;
  }
`;

export const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 8px;
`;

export const StyledCheckboxInput = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
  &:first-of-type {
    margin-top: 8px;
  }
`;

export const StyledCheckBox = styled.div<{ $checked: boolean }>`
  width: 12px;
  min-width: 12px;
  height: 12px;
  background: ${({ theme, $checked }) =>
    $checked ? theme.colors.textPink : theme.colors.landingBackground};
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  border-color: ${({ theme, $checked }) =>
    $checked ? theme.colors.textPink : '#8f8f8f'};
  & svg {
    color: ${({ theme }) => theme.colors.landingBackground};
  }
`;
