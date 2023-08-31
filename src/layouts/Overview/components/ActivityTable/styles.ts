import styled from 'styled-components';

export const StatusLabel = styled.div<{ $success?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 82px;
  height: 24px;
  border-radius: 100px;
  font-weight: 500;
  font-size: 12px;
  ${({ $success, theme }) =>
    $success
      ? `
        background-color: ${theme.colors.successBackground};
        color: ${theme.colors.textSuccess};`
      : `
        background-color: #FAE6E8;
        color: #DB2C3E;
      `}
`;

export const IdCellWrapper = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    color: ${({ theme }) => theme.colors.textBlue};
    text-decoration: underline;
    cursor: pointer;
  }
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledTime = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const AddressCellWrapper = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;

  & div {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
