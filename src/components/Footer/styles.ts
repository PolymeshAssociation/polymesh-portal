import styled from 'styled-components';

export const StyledFooter = styled.footer<{ isLandingPage: boolean }>`
  border-top: 2px solid #f0f0f0;
  color: #727272;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  ${({ isLandingPage }) =>
    isLandingPage &&
    `
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100vw;
    background-color: transparent;
  `}
`;

export const StyledContainer = styled.div<{ isLandingPage: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: ${({ isLandingPage }) => (isLandingPage ? '0 64px' : '0 48px')};

  @media screen and (max-width: 1023px) {
    justify-content: center;
  }
  & p {
    @media screen and (max-width: 1023px) {
      padding: 8px 0;
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
  }
`;
