import styled from 'styled-components';

export const StyledMain = styled.main`
  ${({ theme, isLandingPage }) => `
  ${
    isLandingPage
      ? `
      width: 100vw;
      height: 100vh;
      `
      : `
      min-height: calc(100vh - 16px - 72px - 55px);
      padding: 36px 48px;
      `
  }
  background-color: ${
    isLandingPage
      ? theme.colors.landingBackground
      : theme.colors.dashboardBackground
  };
  `}
`;
