import styled from 'styled-components';

export const StyledPaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

export const StyledPaginationButton = styled.button`
  background-color: transparent;
  color: #1e1e1e;
  transition: color 250ms ease-out;

  &:hover {
    color: #ff2e72;
  }

  &:disabled {
    color: #c7c7c7;
  }
`;
