import styled from 'styled-components';

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

export const StyledDateTimeCell = styled.span`
  display: inline-flex;
  gap: 4px;
  flex-wrap: wrap;
  @media screen and (min-width: 1200px) {
    min-width: 200px;
  }
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

export const AssetIdCellWrapper = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: none;
  & div {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
