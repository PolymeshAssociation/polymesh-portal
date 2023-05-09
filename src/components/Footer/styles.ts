import styled from 'styled-components';

export const StyledFooter = styled.footer<{ isLandingPage: boolean }>`
  border-top: 2px solid ${({ theme }) => theme.colors.lightAccent};
  color: ${({ theme }) => theme.colors.textSecondary};
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
  padding: ${({ isLandingPage }) => (isLandingPage ? '0 64px' : '0 48px')};
`;

export const StyledLinkList = styled.ul`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: auto;
`;

export const StyledLink = styled.a`
  display: inline-block;
  padding: 16px 0;
  font-weight: 500;
  font-size: 14px;
`;
