import styled from 'styled-components';

export const StyledLegendItem = styled.li<{
  $color: string;
  $expandable?: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: ${({ $expandable }) => ($expandable ? 'pointer' : 'initial')};

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
    background-color: ${({ $color }) => $color};
    flex-shrink: 0;
  }
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
