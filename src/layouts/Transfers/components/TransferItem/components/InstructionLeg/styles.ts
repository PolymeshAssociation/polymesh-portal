import { AffirmationStatus } from '@polymeshassociation/polymesh-sdk/types';
import styled from 'styled-components';

export const StyledLegWrapper = styled.div`
  padding: 24px;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
`;

export const StyledNftsWrapper = styled.div`
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledNftItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 12px;
  background: ${({ theme }) => theme.colors.landingBackground};
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.pinkBackground};
  }
`;

export const StyledNftImage = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textPink};
  background: ${({ theme }) => theme.colors.pinkBackground};
  & > img {
    display: block;
    width: 100%;
  }
`;

export const StyledLeg = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;

  @media screen and (max-width: 1023px) {
    flex-direction: column;
    align-items: flex-start;
  }

  @media screen and (min-width: 1024px) and (max-width: 1199px) {
    flex-wrap: wrap;
  }
`;

export const StyledInfoItem = styled.div<{ $isLoading?: boolean }>`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  ${({ $isLoading }) => ($isLoading ? 'width: 10%;' : '')}
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

export const StyledInfoValue = styled.div<{
  $affirmationStatus?: AffirmationStatus;
}>`
  display: flex;
  align-items: center;
  gap: 4px;
  ${({ $affirmationStatus }) => {
    if (!$affirmationStatus) return '';

    return `
    &::before {
      content: '';
      display: block;
      border-radius: 50%;
      width: 8px;
      height: 8px;
      background-color: ${
        $affirmationStatus === AffirmationStatus.Affirmed
          ? '#00AA5E'
          : '#E3A30C'
      };
    }
    
    `;
  }}
`;

export const StyledLabel = styled.div<{ $isError?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 16px;
  background-color: ${({ $isError }) => ($isError ? '#DB2C3E' : '#170087')};
  border-radius: 100px;
  color: #ffffff;
  font-weight: 500;
  font-size: 12px;
  text-transform: capitalize;
  ${({ $isError }) => ($isError ? `cursor: pointer;` : '')}
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

export const StyledClickableWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
`;
