import styled from 'styled-components';

export const StyledWrapper = styled.div<{ expanded: boolean }>`
  width: 320px;
  max-height: ${({ expanded }) => (expanded ? '70vh' : 0)};
  overflow-y: scroll;
  padding: ${({ expanded }) => (expanded ? '24px' : 0)};
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  border-radius: 24px;
  opacity: ${({ expanded }) => (expanded ? 1 : 0)};
  ${({ expanded }) => (expanded ? '' : 'transform: translateX(150%);')}

  transition: transform ease-out 250ms,
    opacity 250ms ease-out, max-height 250ms ease-out, padding 250ms ease-out;
`;

export const StyledCloseButton = styled.button`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 24px;
  right: 24px;
  background-color: transparent;
  cursor: pointer;
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
    background-color: #ffebf1;
  }
`;

export const StyledTimestamp = styled.p`
  margin-top: 16px;
  font-size: 12px;
`;
