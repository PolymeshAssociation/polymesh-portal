import styled from 'styled-components';

export const StyledScopeItem = styled.li`
  width: 100%;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 32px;
`;

export const StyledScopeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;

  @media screen and (max-width: 1023px) {
    flex-direction: column;
    gap: 24px;
  }
`;

export const StyledScopeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;

  @media screen and (max-width: 1023px) {
    width: 100%;
    justify-content: space-between;
  }
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

export const StyledIconWrapper = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
`;

export const StyledSort = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin-top: 24px;

  @media screen and (min-width: 768px) {
    margin-top: 0;
    &::after {
      content: '';
      display: block;
      width: 1px;
      height: 32px;
      margin-left: 24px;
      background-color: #e6e6e6;
    }
  }
`;

export const StyledActionsWrapper = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 24px;

  @media screen and (max-width: 1023px) {
    width: 100%;
    & button {
      flex-grow: 1;
    }
  }

  & button {
    & .expand-icon {
      transform: ${({ $expanded }) =>
        $expanded ? `rotate(180deg)` : `rotate(0)`};
    }
  }
`;

export const StyledSortSelect = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-left: 2px;
  padding-left: 2px;
  padding-right: 16px;

  & .dropdown-icon {
    position: absolute;
    top: -5%;
    right: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  & select {
    position: relative;
    z-index: 1;
    appearance: none;
    display: flex;
    align-items: flex-end;
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: none;
    outline: none;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textPrimary};
    padding: 0px 5px;
    cursor: pointer;
  }

  & .options {
    background-color: ${({ theme }) => theme.colors.modalBackground};
  }
`;
