import styled from 'styled-components';

export const StyledWrapper = styled.div<{ expanded: boolean }>`
  @media screen and (max-width: 767px) {
    width: 100vw;
    height: ${({ expanded }) => (expanded ? '100vh' : 0)};
  }
  width: 320px;
  @media screen and (min-width: 768px) {
    max-height: ${({ expanded }) => (expanded ? '70vh' : 0)};
    border-radius: 24px;
  }
  overflow-y: scroll;
  padding: ${({ expanded }) => (expanded ? '24px' : 0)};
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  opacity: ${({ expanded }) => (expanded ? 1 : 0)};
  ${({ expanded }) => (expanded ? '' : 'transform: translateX(150%);')}

  transition: transform ease-out 250ms,
    opacity 250ms ease-out, max-height 250ms ease-out, padding 250ms ease-out;
`;

export const StyledTopContainer = styled.div`
  position: relative;
  margin-bottom: 32px;
`;

export const StyledCloseButton = styled.button`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  right: 0;
  background-color: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: color 250ms ease-out;

  &:hover {
    color: #ff2e72;
  }
`;

export const StyledNotificationItem = styled.div`
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  cursor: pointer;

  transition: background-color 250ms ease-out;

  &:not(:first-child) {
    margin-top: 16px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.pinkBackground};
  }
`;

export const StyledTimestamp = styled.p`
  margin-top: 16px;
  font-size: 12px;
`;
