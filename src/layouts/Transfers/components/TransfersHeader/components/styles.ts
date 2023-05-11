import styled from 'styled-components';

export const StyledLabel = styled.label`
  display: block;
  margin-bottom: 3px;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StyledInput = styled.input`
  outline: none;
  width: 100%;
  height: 36px;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  padding: 9px 16px;
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
`;
