import styled, { css } from 'styled-components';

export const StyledContainer = styled.div`
  grid-area: staking-info;
`;

export const StyledWrapper = styled.div<{ $cardWidth?: number }>`
  display: grid;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
  gap: 10px;

  ${({ $cardWidth }) => {
    if (!$cardWidth) {
      return css`
        display: flex;
      `;
    }
    if ($cardWidth < 400) {
      return css`
        grid-template-columns: auto;
        justify-content: left;
      `;
    }
    if ($cardWidth < 550) {
      return css`
        grid-template-columns: auto auto;
      `;
    }
    if ($cardWidth < 1000) {
      return css`
        grid-template-columns: auto auto auto;
      `;
    }
    return css`
      grid-template-columns: repeat(6, auto);
    `;
  }}
`;

export const StyledAsset = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledInfoItem = styled.span`
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  & .item-label {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    min-height: 24px;
  }
  & p {
    font-size: 14px;
  }

  @media screen and (max-width: 1199px) {
    font-size: 10px;
    & p {
      font-size: 14px;
    }
  }
`;

export const StyledInfoItemLabel = styled.div`
  display: flex;
  flex-direction: row;
`;
