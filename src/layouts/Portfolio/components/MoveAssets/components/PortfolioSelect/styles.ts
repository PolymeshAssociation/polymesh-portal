import styled from 'styled-components';

export const StyledPlaceholder = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

export const PortfolioSelectWrapper = styled.div`
  position: relative;
`;

export const StyledPortfolioSelect = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 12px 0 16px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  cursor: pointer;

  & .expand-icon {
    transform: ${({ $expanded }) =>
      $expanded ? `rotate(180deg)` : `rotate(0)`};
  }
`;

export const StyledExpandedSelect = styled.div`
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  z-index: 1;
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
`;

export const StyledSelectOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;

  &:not(:first-child) {
    margin-top: 8px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.dashboardBackground};
  }
`;
