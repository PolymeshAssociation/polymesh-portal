import styled from 'styled-components';

export const StyledTableWrapper = styled.div`
  & table thead tr {
    cursor: default;
  }
  & table tr {
    cursor: pointer;
  }
  & table thead td {
    font-size: 12px;
    @media screen and (min-width: 1200px) {
      font-size: 14px;
    }
  }
`;

export const StyledIdWrapper = styled.div`
  font-weight: 500;
  cursor: pointer;
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 10px;
  &:hover {
    text-decoration: underline;
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

export const StyledButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;
