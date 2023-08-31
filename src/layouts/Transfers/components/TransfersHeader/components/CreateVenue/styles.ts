import styled from 'styled-components';

export const StyledSelect = styled.div<{
  $expanded: boolean;
  $isSelected: boolean;
}>`
  width: 100%;
  height: 36px;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 14px;
  color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.textSecondary : theme.colors.textPrimary};

  & .icon {
    position: absolute;
    bottom: 10px;
    right: 16px;
    color: ${({ theme }) => theme.colors.textSecondary};
    transition: transform 250ms ease-out;
    ${({ $expanded }) =>
      $expanded ? `transform: rotate(180deg);` : 'transform: rotate(0);'}
  }
`;

export const InputWrapper = styled.div<{ $marginBottom?: number }>`
  position: relative;
  margin-bottom: ${({ $marginBottom }) =>
    $marginBottom ? `${$marginBottom}px` : 0};
`;

export const StyledExpandedSelect = styled.div`
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  padding: 8px;
  max-height: 200px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  overflow-y: scroll;
  z-index: 1;
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
`;

export const StyledOption = styled.button<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 16px;
  border-radius: 16px;
  background-color: ${({ theme, $isSelected }) =>
    $isSelected
      ? theme.colors.dashboardBackground
      : theme.colors.landingBackground};
  font-size: 14px;
  text-align: left;
  transition: background-color 250ms ease-out;

  &:hover:enabled {
    background-color: ${({ theme }) => theme.colors.dashboardBackground};
  }
  &:disabled {
    color: #8f8f8f;
  }
  &:not(:first-child) {
    margin-top: 8px;
  }
`;

export const StyledErrorMessage = styled.span`
  position: absolute;
  top: 100%;
  left: 0;
  font-size: 12px;
  font-weight: 500;
  color: #db2c3e;
`;
