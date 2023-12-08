import styled, { css } from 'styled-components';

export const StyledContainer = styled.div`
  grid-area: staking-info;
`;

export const StyledWrapper = styled.div<{ $cardWidth?: number }>`
  display: grid;
  padding: 36px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 36px;
  @media screen and (max-width: 860px) {
    padding: 24px;
  }

  ${({ $cardWidth }) => {
    if (!$cardWidth) {
      return css`
        display: flex;
      `;
    }
    if ($cardWidth < 560) {
      return css`
        gap: 24px; 
        grid-template-columns: auto;
        justify-content: left;
      `;
    }
    if ($cardWidth < 900) {
      return css`
        gap: 24px;
        grid-template-columns: auto auto;
      `;
    }
    return css`
      grid-template-columns: repeat(3, auto);
    `;
  }}
`;

export const StyledInfoItem = styled.span`
  display: flex;
  flex-direction: column;
  font-size: 16px;
  & .item-label {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    min-height: 24px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  & p {
    font-size: 20px;
  }
`;
