import styled, { css } from 'styled-components';

export const StyledAccountItemWrapper = styled.div<{
  $cardWidth?: number;
}>`
  display: grid;
  grid-template-columns: auto;
  flex-wrap: wrap;
  gap: 36px;
  justify-content: normal;
  grid-template-columns: auto auto auto;

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
      grid-template-columns: auto auto auto;
    `;
  }}

  & .staking-account-item {
    display: inline-flex;
    white-space: nowrap;
    flex-direction: column;
    font-size: 14px;
  }
`;

export const StyledNameOrKey = styled.div`
  max-width: 150px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const Label = styled.span`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Value = styled.span`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  gap: 10px;
  font-weight: 500;
  font-size: 16px;
  & > .grayed {
    margin-left: -6px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
