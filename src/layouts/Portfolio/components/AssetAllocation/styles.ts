import styled from 'styled-components';

export const StyledWrapper = styled.div`
  grid-area: assets;
  padding: 24px;
  height: 196px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
`;

export const StyledPercentageBar = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 56px;
  margin-top: 22px;
  border-radius: 8px;
  overflow: hidden;
`;

export const StyledFraction = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  background-color: ${({ color }) => color};
`;

export const StyledLegendList = styled.ul`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 25px;
`;

export const StyledLegendItem = styled.li<{
  color: string;
  expandable?: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: ${({ expandable }) => (expandable ? 'pointer' : 'initial')};

  & span {
    margin-left: 4px;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &::before {
    content: '';
    width: 12px;
    height: 12px;
    margin-right: 8px;
    border-radius: 50%;
    background-color: ${({ color }) => color};
  }
`;

export const StyledPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 56px;
  margin-top: 22px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledExpandedOtherAssets = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 160px;
  max-height: 320px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.textSecondary};
  background-color: ${({ theme }) => theme.colors.landingBackground};
  overflow-y: scroll;
  cursor: initial;
`;
