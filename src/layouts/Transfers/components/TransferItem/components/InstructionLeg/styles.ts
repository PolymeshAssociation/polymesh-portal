import { AffirmationStatus } from '@polymeshassociation/polymesh-sdk/types';
import styled from 'styled-components';

export const StyledLeg = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;
`;

export const StyledInfoItem = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledInfoValue = styled.div<{
  affirmationStatus?: AffirmationStatus;
}>`
  display: flex;
  align-items: center;
  gap: 4px;
  ${({ affirmationStatus }) => {
    if (!affirmationStatus) return '';

    return `
    &::before {
      content: '';
      display: block;
      border-radius: 50%;
      width: 8px;
      height: 8px;
      background-color: ${
        affirmationStatus === AffirmationStatus.Affirmed ? '#00AA5E' : '#E3A30C'
      };
    }
    
    `;
  }}
`;

export const StyledLabel = styled.div<{ isError?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 16px;
  background-color: ${({ isError }) => (isError ? '#DB2C3E' : '#170087')};
  border-radius: 100px;
  color: #ffffff;
  font-weight: 500;
  font-size: 12px;
  text-transform: capitalize;
  ${({ isError }) => (isError ? `cursor: pointer;` : '')}
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
