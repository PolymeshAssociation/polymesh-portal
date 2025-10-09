import styled from 'styled-components';

export const StyledModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const StyledButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
`;

export const StyledInputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 14px;
  font-weight: 500;
`;

export const InputWithButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

export const StyledInput = styled.input`
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 14px;
  outline: none;
  width: 100%;
`;

export const StyledLabel = styled.label`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 14px;
  font-weight: 500;
`;

export const StyledCaption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 400;
`;

export const StyledErrorMessage = styled.span`
  display: flex;
  justify-content: flex-end;
  font-size: 12px;
  font-weight: 500;
  color: #db2c3e;
`;

export const StyledMaxButton = styled.button<{ $maxSet?: boolean }>`
  position: absolute;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 10px;
  height: 28px;
  border-radius: 14px;
  background-color: ${({ $maxSet, theme }) =>
    $maxSet ? `transparent` : theme.colors.pinkBackground};
  font-size: 14px;
  color: ${({ $maxSet, theme }) =>
    $maxSet ? theme.colors.textPrimary : theme.colors.textPink};
  cursor: ${({ $maxSet }) => ($maxSet ? 'unset' : `pointer`)};
  border: 1px solid transparent;
  transition-property: color, background;
  transition-duration: ${({ theme }) => theme.transition.normal};
  transition-timing-function: ease-out;

  &:hover:enabled {
    background: ${({ $maxSet, theme }) =>
      $maxSet ? `` : theme.colors.textPink};
    color: ${({ $maxSet, theme }) =>
      $maxSet ? `` : theme.colors.pinkBackground};
  }
  &:active:enabled {
    background-color: ${({ $maxSet, theme }) =>
      $maxSet ? '' : theme.colors.textPink};
    color: ${({ $maxSet, theme }) =>
      $maxSet ? `` : theme.colors.pinkBackground};
  }

  &:disabled {
    border: 1px solid ${({ theme }) => theme.colors.textDisabled};
    background: transparent;
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`;

export const StyledIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px;
  margin-right: 4px;
  border-radius: 100%;
  background-color: #00aa5e;
  color: white;
`;
