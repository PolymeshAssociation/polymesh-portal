import styled from 'styled-components';

export const StyledPaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

export const StyledPaginationButton = styled.button`
  display: flex;
  padding: 0;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: color 250ms ease-out;

  &:hover {
    color: #ff2e72;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`;
