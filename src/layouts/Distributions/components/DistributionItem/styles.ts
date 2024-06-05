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

export const StyledInfoItem = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  @media screen and (max-width: 1023px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
  }
  @media screen and (min-width: 1024px) and (max-width: 1399px) {
    & p {
      font-size: 14px;
    }
    & svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const StyledSelect = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.textPink : 'transparent'};
  border: 2px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.textPink : theme.colors.textDisabled};
  color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.landingBackground : 'transparent'};
  transition:
    background-color 250ms ease-out,
    border 250ms ease-out,
    color 250ms ease-out;
  cursor: pointer;
`;

export const StyledButtonsWrapper = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 24px;

  & button {
    flex-grow: 1;
  }

  & .expand-icon {
    transform: ${({ $expanded }) =>
      $expanded ? `rotate(180deg)` : `rotate(0)`};
  }
`;

export const StyledDetails = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  @media screen and (max-width: 1023px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const StyledInfoValue = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const StyledLabel = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 16px;
  background-color: #db2c3e;
  border-radius: 100px;
  color: #ffffff;
  font-weight: 500;
  font-size: 12px;
  text-transform: capitalize;
  cursor: pointer;
`;

export const StyledExpandedErrors = styled.ul`
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 128px;
  max-width: 300px;
  background-color: #fae6e8;
  border-radius: 16px;
  padding: 8px 16px;
  color: #db2c3e;
  text-transform: initial;
  cursor: initial;
  z-index: 1;

  & li {
    list-style: circle;
    margin-left: 8px;
  }
`;
