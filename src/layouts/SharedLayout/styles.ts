import styled from 'styled-components';

export const StyledMain = styled.main<{
  isLandingPage: boolean;
}>`
  ${({ theme, isLandingPage }) => `
  ${
    isLandingPage
      ? `
      width: 100vw;
      height: 100vh;
      `
      : `
      flex-grow: 1;
      min-height: calc(100vh - 16px - 72px - 55px);
      padding: 24px;

      @media screen and (min-width: 768px) {
        padding: 24px 36px 36px 36px;
      }
      @media screen and (min-width: 1200px) {
        padding: 36px 48px;
      }
      `
  }
  background-color: ${
    isLandingPage
      ? theme.colors.landingBackground
      : theme.colors.dashboardBackground
  };
  `}
`;

export const StyledPageWrapper = styled.div`
  display: flex;
  width: 100vw;
  min-height: 100vh;

  & .main-wrapper {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
`;
