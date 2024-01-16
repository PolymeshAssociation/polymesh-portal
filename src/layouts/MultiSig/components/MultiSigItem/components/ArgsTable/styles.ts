import styled from 'styled-components';

export const StyledSkeletonWrapper = styled.div`
  margin-bottom: 36px;
`;

export const StyledTableWrapper = styled.div`
  width: 100%;
  overflow-x: scroll;
  border: 10px solid #e6e6e6;
  margin: 12px 0 36px;
`;

export const StyledTable = styled.div`
  display: table;
  table-layout: fixed;
  overflow-x: hidden;
  width: 100%;
  position: relative;
  font-size: 14px;
`;

export const StyledTableRow = styled.div<{ $withBorder: boolean }>`
  width: 100%;
  display: flex;
  position: relative;
  left: 0;
  right: 0;
  &:not(:first-child):after {
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    background-color: #e6e6e6;
    position: absolute;
    left: 0;
    right: 0;
  }
`;

export const StyledTableSubRow = styled.div`
  flex: 1 0 auto;
`;

export const StyledTableHeadCell = styled.div`
  display: flex;
  font-weight: 500;
  min-width: 104px;
  flex: 0 0 auto;
  padding: 5px 12px;
  border-right: 1px solid #e6e6e6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledTableHeadContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const StyledTableCell = styled.div`
  padding: 5px 12px;
  box-sizing: border-box;
  width: 100%;
`;
