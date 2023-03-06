import styled from 'styled-components';

export const StyledHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 48px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
`;

export const StyledInfoList = styled.ul`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const StyledInfoItem = styled.li`
  display: flex;
  align-items: center;
  gap: 16px;

  &:not(:last-child)::after {
    content: '';
    width: 2px;
    height: 32px;
    background-color: #f0f0f0;
  }
`;