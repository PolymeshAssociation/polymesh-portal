import styled from 'styled-components';

export const StyledFooter = styled.footer<{ $isLandingPage: boolean }>`
  border-top: 2px solid ${({ theme }) => theme.colors.lightAccent};
  color: ${({ theme }) => theme.colors.textSecondary};
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  ${({ $isLandingPage }) =>
    $isLandingPage &&
    `
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100vw;
    background-color: transparent;
  `}
`;

export const StyledContainer = styled.div<{ $isLandingPage: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  min-height: 75px;
  padding: ${({ $isLandingPage }) =>
    $isLandingPage ? '0px 164px 0px 64px' : '0px 164px 0px 48px'};

  @media screen and (max-width: 1023px) {
    justify-content: center;
    gap: 8px;
    padding: ${({ $isLandingPage }) =>
      $isLandingPage ? '0 64px 0 64px' : '0px 48px 0px 48px'};
  }
  & p {
    @media screen and (max-width: 1023px) {
      padding: 8px 0;
      font-size: 12px;
    }
  }
`;

export const StyledLinkList = styled.ul`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 24px;
`;

export const StyledLink = styled.a`
  display: inline-block;
  padding: 16px 0;
  font-weight: 500;
  font-size: 14px;

  @media screen and (max-width: 1023px) {
    padding: 8px 0;
    font-size: 12px;
  }
`;
