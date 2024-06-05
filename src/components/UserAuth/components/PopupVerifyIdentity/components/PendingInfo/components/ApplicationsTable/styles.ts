import styled from 'styled-components';

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHeader = styled.th`
  padding: 10px;
  font-size: 14px;
  font-weight: 500;
  border-top: 1px solid #ddd;
  text-align: left;
`;

export const TableRow = styled.tr`
  color: ${({ theme }) => theme.colors.textPrimary};
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
`;

export const TableCell = styled.td`
  padding: 10px;
  text-align: left;
`;
export const ClickableTableCell = styled.td`
  padding: 10px;
  text-align: left;
  color: ${({ theme }) => theme.colors.textPink};
  text-decoration: underline;
  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textPurple};
  }
`;

export const StyledMobileTable = styled.div`
  flex-grow: 1;
`;

export const StyledMobileRow = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid ${({ theme }) => theme.colors.skeletonHighlight};
  padding: 10px;
  &:first-child {
    border-top: 1px solid ${({ theme }) => theme.colors.skeletonHighlight};
  }
`;

export const StyledMobileCell = styled.div`
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  gap: 6px;
  & .header {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  & .data {
    font-weight: 500;
    text-align: right;
    & span {
      justify-content: flex-end;
    }
  }
  & .capitalized {
    text-transform: capitalize;
  }
  & .clickable {
    color: ${({ theme }) => theme.colors.textPink};
    text-decoration: underline;
    &:hover {
      cursor: pointer;
      color: ${({ theme }) => theme.colors.textPurple};
    }
  }
`;
