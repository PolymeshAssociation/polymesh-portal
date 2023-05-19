import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

export const StyledSidebar = styled.aside<{
  fullWidth: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '256px' : '88px')};
  padding: 36px 16px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};

  transition: width 250ms ease-out;

  & .text-logo-icon {
    justify-content: flex-start;
    padding-top: 6px;
    margin-left: 8px;
    margin-bottom: 54px;

    @media screen and (max-width: 767px) {
      justify-content: center;
      margin-bottom: 50px;
      margin-left: 0;
      padding-top: 0;
    }
  }
  & .logo-icon {
    width: 32px;
    margin: 0 auto 48px auto;
  }

  @media screen and (max-width: 480px) {
    & .container {
      max-width: 320px;
      margin: 0 auto;
    }
  }

  @media screen and (max-width: 767px) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    padding: 24px 16px;
    transform: ${({ fullWidth }) =>
      fullWidth ? 'translateX(0)' : 'translateX(-100%)'};
    overflow-y: scroll;
    z-index: 2;
    transition: transform 250ms ease-out;

    & .container {
      width: 420px;
      margin: 0 auto;
    }
  }
`;

export const MenuButton = styled.button<{ fullWidth: boolean }>`
  position: absolute;
  display: flex;
  top: 40px;
  right: ${({ fullWidth }) => (fullWidth ? '16px' : '-16px')};
  padding: 0;
  background-color: transparent;
  cursor: pointer;
  ${({ fullWidth }) => (fullWidth ? 'transform: rotate(180deg);' : '')}
  transition: transform 250ms ease-out;
`;

export const StyledNetworkWrapper = styled.div<{ fullWidth: boolean }>`
  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '208px' : '100%')};
  height: 32px;
  margin: 0 auto 34px auto;
  border-radius: 100px;
  background: linear-gradient(252.2deg, #ff2e72 0%, #4a125e 111.15%);

  @media screen and (max-width: 767px) {
    width: 100%;
  }
`;
export const StyledNetworkStatus = styled.div<{
  fullWidth: boolean;
  isLoading: boolean;
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  padding: 0 0 0 ${({ isLoading }) => (isLoading ? '0' : '28px')};
  border-radius: 100px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  color: ${({ theme }) => theme.colors.textPurple};
  font-weight: 500;
  font-size: 14px;

  transition: text-indent 250ms ease-out 100ms;

  & span {
    transition: opacity 150ms linear;
  }

  @media screen and (min-width: 768px) {
    ${({ fullWidth }) =>
      fullWidth
        ? ''
        : `
      text-indent: -300px;
      & span {
        opacity: 0;
      }
  `}
  }
`;

export const StatusDot = styled.div<{ fullWidth: boolean; isLoading: boolean }>`
  position: absolute;
  left: 0;
  ${({ fullWidth }) =>
    fullWidth
      ? `
      transform: translateX(8px);
      `
      : `
      transform: translateX(172%);
      `}
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(252.2deg, #ff2e72 0%, #4a125e 111.15%);
  ${({ isLoading }) =>
    isLoading
      ? `
      animation: loading-animation 2.2s ease-out infinite;
  `
      : ''}

  transition: left 250ms ease-out, transform 250ms ease-out;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.dashboardBackground};
  }

  @keyframes loading-animation {
    0% {
      transform: translateX(8px);
    }
    50% {
      transform: translateX(1500%);
    }
    100% {
      transform: translateX(8px);
    }
  }
`;

export const StyledNavList = styled.nav<{ fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media screen and (min-width: 768px) {
    & a {
      ${({ fullWidth }) =>
        fullWidth
          ? ''
          : `
    text-indent: -300px;
    & span {
      opacity: 0;
    }
    `}
    }
  }

  & .notification {
    position: absolute;
    text-indent: 0px;
    top: 0;
    right: 0;
    transform: ${({ fullWidth }) =>
      fullWidth ? 'translate(-19px, 19px)' : 'translate(-8px, 8px)'};
    transition: transform 250ms ease-out;
  }
`;

export const StyledNavLink = styled(NavLink)<{ disabled?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  padding: 16px;
  border-radius: 62px;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textDisabled : theme.colors.textSecondary};
  ${({ disabled }) => (disabled ? 'pointer-events: none;' : '')}
  transition: background-color 250ms ease-out, color 250ms ease-out,
    text-indent 250ms ease-out 100ms;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightAccent};
  }

  & .link-icon {
    color: ${({ theme, disabled }) =>
      disabled ? theme.colors.textDisabled : theme.colors.textSecondary};
    transition: color 250ms ease-out;
  }
  &.active {
    background-color: ${({ theme }) => theme.colors.pinkBackground};
    color: ${({ theme }) => theme.colors.textPrimary};

    & .link-icon {
      color: ${({ theme }) => theme.colors.textPink};
    }
  }
  & span {
    transition: opacity 150ms linear;
  }
`;

export const ExpandedLinks = styled.ul`
  position: absolute;
  bottom: 0;
  left: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 186px;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: ${({ theme }) => `0px 15px 25px ${theme.colors.shadow},
    0px 5px 10px rgba(30, 30, 30, 0.05)`};
  border-radius: 12px;
  z-index: 2;

  @media screen and (max-width: 767px) {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    padding: 24px;
  }
`;

export const StyledExpandedLink = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  padding: 16px;
  border-radius: 62px;
  font-weight: 500;
  font-size: 14px;
  background-color: transparent;
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textDisabled : theme.colors.textSecondary};
  ${({ disabled }) => (disabled ? 'pointer-events: none;' : '')}

  transition: background-color 250ms ease-out, color 250ms ease-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.shadow};
  }

  & .link-icon {
    color: ${({ theme, disabled }) =>
      disabled ? theme.colors.textDisabled : theme.colors.textSecondary};
    transition: color 250ms ease-out;
  }
  &.active {
    background-color: ${({ theme }) => theme.colors.pinkBackground};
    color: ${({ theme }) => theme.colors.textPrimary};
    & .link-icon {
      color: ${({ theme }) => theme.colors.textPink};
    }
  }
`;

export const SoonLabel = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 63px;
  height: 24px;
  background-color: #f2efff;
  border-radius: 100px;
  font-weight: 500;
  font-size: 12px;
  color: #43195b;
`;

export const WarningLabelWrapper = styled.div<{ fullWidth: boolean }>`
  position: absolute;
  top: -32px;
  left: 0;
  min-width: 100%;
  display: flex;
  align-items: center;
  justify-content: ${({ fullWidth }) => (fullWidth ? 'flex-start' : 'center')};
  gap: 8px;
`;

export const StyledCloseMenuButton = styled.button`
  position: absolute;
  top: 22px;
  right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  z-index: 2;
`;

export const StyledAccountInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 56px;
  margin-bottom: 28px;
  padding: 0 16px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border-radius: 60px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  font-size: 14px;
  & span {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
