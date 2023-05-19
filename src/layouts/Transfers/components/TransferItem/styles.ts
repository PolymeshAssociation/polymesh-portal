import styled from 'styled-components';

export const StyledItemWrapper = styled.li`
  width: 100%;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 32px;
`;

export const StyledInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  margin-bottom: 24px;
  min-height: 40px;
  gap: 8px;

  @media screen and (max-width: 1023px) {
    flex-direction: column;
    align-items: flex-start;
  }

  & .select-placeholder {
    display: flex;
    align-items: center;
    width: 20px;
  }
`;

export const StyledSelect = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.textPink : 'transparent'};
  border: 2px solid
    ${({ isSelected, theme }) =>
      isSelected ? theme.colors.textPink : theme.colors.textDisabled};
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.landingBackground : 'transparent'};
  transition: background-color 250ms ease-out, border 250ms ease-out,
    color 250ms ease-out;
  cursor: pointer;
`;

export const StyledLegsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

export const StyledMemo = styled.div`
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;

  & span {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledButtonsWrapper = styled.div<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 24px;

  & button {
    flex-grow: 1;
  }
  & button:last-child {
    width: 100%;
    @media screen and (min-width: 1024px) {
      width: initial;
      flex-grow: 0;
    }
    & .expand-icon {
      transform: ${({ expanded }) =>
        expanded ? `rotate(180deg)` : `rotate(0)`};
    }
  }

  & .leg-count {
    color: #1e1e1e;
  }

  @media screen and (max-width: 1023px) {
    flex-wrap: wrap-reverse;
  }
`;
