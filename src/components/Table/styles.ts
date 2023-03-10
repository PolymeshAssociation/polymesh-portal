import styled from 'styled-components';

export const StyledTableWrapper = styled.div`
  grid-area: table;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  border-radius: 24px;
  overflow: hidden;
`;

export const StyledTableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  height: 84px;
`;

export const StyledTableBody = styled.table`
  flex-grow: 1;
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  & tr,
  & thead {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  & th,
  & td {
    width: ${({ colsNumber }) => `calc(100% / ${colsNumber})`};
    height: 54px;
    padding-left: 24px;
    vertical-align: center;
  }

  & thead {
    & td {
      font-size: 16px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.6);
    }
  }
  & td {
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.87);
    text-transform: capitalize;
  }
`;

export const StyledTableFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 56px;
  padding-right: 24px;
`;

export const StyledTablePlaceholder = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 54px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
`;
