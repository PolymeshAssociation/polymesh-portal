import styled from 'styled-components';

export const StyledWrapper = styled.div`
  grid-area: assets;
  padding: 24px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
`;

export const StyledPercentageBar = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
`;

export const StyledFraction = styled.div<{
  $percentage: number;
  $color: string;
}>`
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  background-color: ${({ $color }) => $color};
`;

export const StyledLegendList = styled.ul`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 25px;
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
