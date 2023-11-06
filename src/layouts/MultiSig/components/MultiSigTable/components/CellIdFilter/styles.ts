import styled from 'styled-components';

export const StyledIdCell = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const StyledSortButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  padding: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
