import styled from 'styled-components';

export const StyledScopeItem = styled.li`
  width: 100%;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  border-radius: 32px;
`;

export const StyledScopeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
`;

export const StyledScopeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledScopeLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 100px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StyledIconWrapper = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
`;

export const StyledSort = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};

  &::after {
    content: '';
    display: block;
    width: 1px;
    height: 32px;
    margin-left: 24px;
    background-color: #e6e6e6;
  }
`;

export const StyledActionsWrapper = styled.div<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 24px;

  & button {
    & .expand-icon {
      transform: ${({ expanded }) =>
        expanded ? `rotate(180deg)` : `rotate(0)`};
    }
  }
`;
