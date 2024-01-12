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

export const StyledInput = styled.input`
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 14px;
  outline: none;
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
  margin-top: 10px;
  font-size: 14px;
  font-weight: 400;
`;

export const StyledErrorMessage = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 12px;
  font-weight: 500;
  color: #db2c3e;
`;

export const StyledMaxButton = styled.button`
  position: absolute;
  right: 10px;
  bottom: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background-color: transparent;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textBlue};
  cursor: pointer;

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`;
