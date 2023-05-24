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
`;

export const StyledInfoItem = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
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

export const StyledButtonsWrapper = styled.div<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 24px;

  & button {
    flex-grow: 1;
  }

  & .expand-icon {
    transform: ${({ expanded }) => (expanded ? `rotate(180deg)` : `rotate(0)`)};
  }
`;

export const StyledDetails = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;
  margin-bottom: 24px;
`;

export const StyledInfoValue = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
