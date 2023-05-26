import styled from 'styled-components';

export const StyledWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 16px;
  padding: 20px 16px;

  &:not(:first-child) {
    margin-top: 16px;
  }

  @media screen and (min-width: 768px) {
    width: 400px;
  }
`;

export const StyledTopInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
