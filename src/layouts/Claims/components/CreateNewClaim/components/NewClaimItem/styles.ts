import styled from 'styled-components';

export const StyledWrapper = styled.div`
  width: 400px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 16px;
  padding: 20px 16px;

  &:not(:first-child) {
    margin-top: 16px;
  }
`;

export const StyledTopInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
