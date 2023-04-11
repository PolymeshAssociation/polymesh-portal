import styled from 'styled-components';

export const StyledAddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  margin-bottom: 32px;
  height: 40px;
  padding: 0 16px;
  background-color: transparent;
  color: #170087;

  &:disabled {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
`;

export const StyledInput = styled.input`
  outline: none;
  display: block;
  width: 100%;
  padding: 9px 16px;
  height: 36px;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
