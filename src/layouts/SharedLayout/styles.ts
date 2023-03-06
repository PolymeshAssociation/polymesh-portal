import styled from 'styled-components';

export const StyledMain = styled.main`
  ${({ theme, isLandingPage }) => `
  ${
    isLandingPage
      ? `width: 100vw;
    height: 100vh;`
      : ''
  }
  background-color: ${
    isLandingPage
      ? theme.colors.landingBackground
      : theme.colors.dashboardBackground
  };
  `}
`;
