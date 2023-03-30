import styled from 'styled-components';

export const StyledItemWrapper = styled.li`
  width: 100%;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  border-radius: 32px;
`;

export const StyledInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  margin-bottom: 24px;
`;

export const StyledInfoItem = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledDetailsWrapper = styled.div`
  display: flex;
  gap: 16px;
  padding: 24px;
  margin-bottom: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;
`;

export const StyledDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:not(:first-child)::before {
    content: '';
    display: block;
    width: 1px;
    height: 32px;
    margin-right: 8px;
    background-color: #e6e6e6;
  }
`;

export const StyledDetailValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border-radius: 100px;
`;

export const StyledButtonsWrapper = styled.div<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 24px;

  & button {
    flex-grow: 1;
  }
  & button:last-child {
    flex-grow: 0;
    & .expand-icon {
      transform: ${({ expanded }) =>
        expanded ? `rotate(180deg)` : `rotate(0)`};
    }
  }
`;

export const StyledLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 16px;
  background-color: #170087;
  border-radius: 100px;
  color: #ffffff;
  font-weight: 500;
  font-size: 12px;
`;
