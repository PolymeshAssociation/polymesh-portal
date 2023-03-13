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
  min-height: 108px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
`;

export const StyledTabsWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  gap: 4px;
  padding: 4px;
  border: 1px solid #c7c7c7;
  border-radius: 60px;
`;

export const StyledTabItem = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
  border-radius: 100px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: capitalize;
  cursor: pointer;

  transition: color 250ms ease-out, background-color 250ms ease-out;

  ${({ selected }) =>
    selected
      ? `
      background-color: #FF2E72;
      color: #ffffff;`
      : ''};
`;

export const StyledPerPageWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledPerPageSelect = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 34px;
  margin-left: 2px;
  padding-left: 2px;

  & .dropdown-icon {
    position: absolute;
    top: -5%;
    right: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  & select {
    position: relative;
    z-index: 1;
    appearance: none;
    display: flex;
    align-items: flex-end;
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: none;
    outline: none;
    font-size: 14px;
  }
`;
