import styled from 'styled-components';
import { TransactionStatus } from '@polymeshassociation/polymesh-sdk/types';

export const StyledStatusWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const handleStatusType = (status: `${TransactionStatus}`) => {
  switch (status) {
    case TransactionStatus.Unapproved:
      return `
        background-color: #E6F9FE;
        color: #046C7C;
        `;

    case TransactionStatus.Running:
      return `
        background-color: #170087;
        color: #ffffff;
        `;

    case TransactionStatus.Succeeded:
      return `
        background-color: #D4F7E7;
        color: #00AA5E;
        `;

    case TransactionStatus.Rejected:
      return `
        background-color: #FAE6E8;
        color: #DB2C3E;
        `;

    case TransactionStatus.Failed:
      return `
        background-color: #FAE6E8;
        color: #DB2C3E;
        `;

    case TransactionStatus.Aborted:
      return `
        background-color: #FBF3D0;
        color: #E3A30C;
        `;

    default:
      return '';
  }
};

export const StyledStatusLabel = styled.div<{ status: `${TransactionStatus}` }>`
  padding: 1px 8px;
  border-radius: 100px;
  font-weight: 500;
  font-size: 10px;
  ${({ status }) => handleStatusType(status)}
`;

export const StyledDetailsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const StyledDetail = styled.div<{ isIcon: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  color: ${({ theme }) => theme.colors.textSecondary};
  ${({ isIcon }) =>
    isIcon
      ? `
    width: 32px;
    border-radius: 50%;
    `
      : `
    flex-grow: 1;
    border-radius: 32px;
    font-weight: 500;
    font-size: 12px;    
    `}
`;

export const StyledLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledError = styled.span`
  font-size: 12px;
  color: #db2c3e;
`;

export const StyledTimestamp = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
