import styled from 'styled-components';

export const StyledWrapper = styled.div`
  position: fixed;
  top: 80px;
  right: 24px;
  width: 320px;
  max-height: 720px;
  overflow-y: scroll;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  border-radius: 24px;
  z-index: 1;
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

  &:hover {
    background-color: #ffebf1;
  }
`;

export const StyledTimestamp = styled.p`
  margin-top: 16px;
  font-size: 12px;
`;
