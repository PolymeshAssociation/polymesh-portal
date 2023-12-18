import styled from 'styled-components';

export const StyledBreadcrumbsContainer = styled.ul`
  display: flex;
  align-items: center;
`;

export const StyledBreadcrumb = styled.li`
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  &:not(:last-child) {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textPrimary};
    &::after {
      content: '/';
      color: ${({ theme }) => theme.colors.textPrimary};
      display: inline-block;
      padding: 4px;
    }
  }
  &:last-child {
    color: #8f8f8f;
  }
`;
