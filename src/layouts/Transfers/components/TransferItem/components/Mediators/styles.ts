import { AffirmationStatus } from '@polymeshassociation/polymesh-sdk/types';
import styled from 'styled-components';

export const StyledMediatorList = styled.div`
  padding: 24px;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  margin-bottom: 24px;
`;

export const StyledHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 1fr) minmax(200px, 1fr) auto;
  column-gap: auto;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;

  & > div {
    text-align: left;

    &:last-child {
      min-width: 150px;
    }
  }

  @media screen and (max-width: 1023px) {
    display: none;
  }
`;

export const StyledMediatorItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
  padding: 8px 0;
  align-items: flex-start;

  @media screen and (min-width: 1024px) {
    display: grid;
    grid-template-columns: minmax(200px, 1fr) minmax(200px, 1fr) auto;
    gap: 48px;
    align-items: center;
  }
`;

export const StyledInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  justify-content: space-between;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media screen and (min-width: 1024px) {
    justify-content: flex-start;
    width: auto;
  }
`;

export const StyledInfoValue = styled.div<{
  $affirmationStatus?: AffirmationStatus;
  $isExpired?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 4px;
  ${({ $affirmationStatus, $isExpired }) => {
    if (!$affirmationStatus) return '';

    let backgroundColor = '#E3A30C';
    if (!$isExpired && $affirmationStatus === AffirmationStatus.Affirmed) {
      backgroundColor = '#00AA5E';
    }

    return `
    &::before {
      content: '';
      display: block;
      border-radius: 50%;
      width: 8px;
      height: 8px;
      background-color: ${backgroundColor};
    }
    `;
  }}
`;

export const StyledStatus = styled.div<{
  $isExpired?: boolean;
  $isAffirmed?: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 16px;
  min-width: 150px;
  background-color: ${({ $isExpired, $isAffirmed }) => {
    if ($isExpired) return '#E3A30C';
    if ($isAffirmed) return '#00AA5E';
    return '#170087';
  }};
  border-radius: 100px;
  color: #ffffff;
  font-weight: 500;
  font-size: 12px;
  text-transform: capitalize;
  white-space: nowrap;

  @media screen and (max-width: 1023px) {
    justify-content: center;
    width: auto;
  }
`;

export const StyledExpiryWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media screen and (min-width: 1024px) {
    justify-content: flex-start;
    width: auto;
  }
`;

export const StyledExpiry = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: right;
  width: 100%;

  @media screen and (min-width: 1024px) {
    text-align: left;
    width: auto;
  }
`;
