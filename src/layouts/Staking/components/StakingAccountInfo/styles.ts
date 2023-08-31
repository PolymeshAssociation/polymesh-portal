import styled, { css } from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  grid-area: account-info;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
  gap: 10px;
  min-height: 310px;

  @media screen and (max-width: 1200px) {
    width: 100%;
  }
`;

export const StyledAccountItemWrapper = styled.div<{
  $cardWidth?: number;
}>`
  display: grid;
  grid-template-columns: auto;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-evenly;
  grid-template-columns: auto auto auto;

  ${({ $cardWidth }) => {
    if (!$cardWidth) {
      return css`
        display: flex;
      `;
    }
    if ($cardWidth < 420) {
      return css`
        grid-template-columns: auto;
        justify-content: left;
      `;
    }
    if ($cardWidth < 600) {
      return css`
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

export const Label = styled.span`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
export const Value = styled.span`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  gap: 10px;
  font-weight: 500;
  @media screen and (min-width: 1199px) {
    font-size: 16px;
  }
`;

export const StyledButtonWrapper = styled.div<{ $cardWidth?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 12px;
  flex-direction: ${({ $cardWidth }) =>
    $cardWidth && $cardWidth < 420 ? 'column' : 'row'};
  & button {
    width: 100%;
  }
`;

export const IconWrapper = styled.div<{ $size?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => $size || '32px'};
  height: ${({ $size }) => $size || '32px'};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.pinkBackground};

  & .staking-icon,
  & .id-icon {
    color: ${({ theme }) => theme.colors.textPink};
  }
  & .copy-icon {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledTopInfo = styled.div`
  position: relative;
  display: flex;
  align-content: center;
  justify-content: center;
  gap: 12px;

  & .heading-wrapper {
    align-items: center;
    display: flex;
    flex-grow: 1;
  }
`;

export const StyledTextWrapper = styled.div`
  padding: 30px 0px;
`;

export const StyledNameOrKey = styled.div`
  max-width: 150px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
