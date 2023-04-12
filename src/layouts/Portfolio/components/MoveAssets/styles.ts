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
