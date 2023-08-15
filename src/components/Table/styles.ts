import styled from 'styled-components';

export const StyledTableWrapper = styled.div`
  grid-area: table;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
  /* overflow: hidden; */

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

  @media screen and (max-width: 767px) {
    & > div {
      width: 100%;
      text-transform: capitalize;
      & button {
        text-transform: capitalize;
      }
    }
  }

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
    border-top: 1px solid ${({ theme }) => theme.colors.shadow};
    border-bottom: 1px solid ${({ theme }) => theme.colors.shadow};
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
      color: ${({ theme }) => theme.colors.textSecondary};

      @media screen and (min-width: 1200px) {
        font-size: 16px;
      }
    }
  }
  & td {
    font-size: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textPrimary};
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
  border-bottom: 1px solid ${({ theme }) => theme.colors.shadow};
  &:first-child {
    border-top: 1px solid ${({ theme }) => theme.colors.shadow};
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
    color: ${({ theme }) => theme.colors.textSecondary};
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
  height: 60px;
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

  & .download {
    margin-right: auto;
    margin-left: 24px;
    padding-right: 30px;

    & .download-icon {
      & svg path {
        fill: ${({ theme }) => theme.colors.textPink};
        transition: fill 0.3s;
      }
      & svg rect {
        fill: transparent;
      }
      transform: scale(1.5);
    }

    &:hover:enabled .download-icon svg path,
    &:focus:enabled .download-icon svg path {
      fill: ${({ theme }) => theme.colors.pinkBackground};
    }

    &:disabled .download-icon svg path {
      fill: ${({ theme }) => theme.colors.textDisabled};
    }
  }
`;

export const StyledTablePlaceholder = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* gap: 14px; */
  width: 100%;
  min-height: 108px;
  border-top: 1px solid ${({ theme }) => theme.colors.shadow};
  border-bottom: 1px solid ${({ theme }) => theme.colors.shadow};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledLoaderPlaceholder = styled.div`
  height: 54px;
  width: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.shadow};
  }

  & .skeleton-wrapper {
    display: flex;
    align-items: center;
    gap: 24px;
  }
`;

export const StyledTabsWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  min-width: 160px;
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
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  & .options {
    background-color: ${({ theme }) => theme.colors.modalBackground};
  }
`;
