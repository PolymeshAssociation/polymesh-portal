import styled from 'styled-components';

export const StyledInput = styled.input`
  display: block;
  width: 100%;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 14px;
  outline: none;
  color: ${({ theme }) => theme.colors.textPrimary};
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
`;
