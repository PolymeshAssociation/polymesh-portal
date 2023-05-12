import styled from 'styled-components';

export const StyledTableWrapper = styled.div`
  grid-area: table;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  border-radius: 24px;
  overflow: hidden;

  @media screen and (max-width: 1023px) {
    width: 100%;
  }
`;

export const StyledTableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  height: 84px;

  @media screen and (max-width: 1023px) {
    flex-direction: column;
    align-items: flex-start;
    height: auto;
    gap: 16px;
  }
`;

export const StyledTableBody = styled.table<{ colsNumber: number }>`
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
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.6);

      @media screen and (min-width: 1200px) {
        font-size: 16px;
      }
    }
  }
  & td {
    font-size: 12px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.87);
    text-transform: capitalize;

    @media screen and (min-width: 1200px) {
      font-size: 14px;
    }
  }
`;

export const StyledMobileTable = styled.div`
  flex-grow: 1;
`;

export const StyledMobileRow = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  &:first-child {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }
`;

export const StyledMobileCell = styled.div`
  padding: 8px 24px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  & .header {
    color: rgba(0, 0, 0, 0.6);
  }
  & .data {
    max-width: 70%;
    font-weight: 500;
    text-transform: capitalize;
    text-align: right;
    & span {
      justify-content: flex-end;
    }
  }
`;

export const StyledTableFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 56px;
  padding-right: 24px;

  @media screen and (max-width: 1023px) {
    padding: 24px;
    height: auto;
    gap: 16px;
    & button {
      flex-grow: 1;
      padding-left: 0;
      padding-right: 0;
    }
  }
`;

export const StyledTablePlaceholder = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 100%;
  min-height: 108px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledTabsWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  gap: 4px;
  padding: 4px;
  border: 1px solid #c7c7c7;
  border-radius: 60px;

  @media screen and (max-width: 1023px) {
    width: 100%;

    & div {
      flex-grow: 1;
    }
  }
`;

export const StyledTabItem = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
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
