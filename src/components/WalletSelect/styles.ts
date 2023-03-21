import styled from 'styled-components';
import { ESelectPlacements } from './types';

export const StyledSelectWrapper = styled.div<{
  placement: `${ESelectPlacements}`;
}>`
  position: relative;
  cursor: pointer;
  ${({ placement }) =>
    placement === ESelectPlacements.HEADER
      ? `
      padding-right: 16px;
      min-width: 94px;
      `
      : ''}
  ${({ placement }) =>
    placement === ESelectPlacements.WIDGET
      ? `
      flex-grow: 1;
      background-color: rgba(255, 255, 255, 0.24);
      border-radius: 32px;

      `
      : ''}
`;

export const StyledSelect = styled.div<{
  placement: `${ESelectPlacements}`;
  expanded: boolean;
}>`
  font-weight: 500;
  font-size: 12px;

  ${({ placement, theme }) =>
    placement === ESelectPlacements.HEADER
      ? `
      color: ${theme.colors.textPrimary};
      text-align: center;

      & div {
        color: ${theme.colors.textPrimary};
      }
      `
      : ''}
  ${({ placement, theme }) =>
    placement === ESelectPlacements.WIDGET
      ? `
      padding: 7px 28px 7px 8px;
      color: ${theme.colors.dashboardBackground};
      text-align: center;

      & div {
        right: 8px;
        color: ${theme.colors.dashboardBackground};
      }
      `
      : ''}
    & div {
    transition: transform 250ms ease-out;
    ${({ expanded }) =>
      expanded ? `transform: rotate(90deg);` : 'transform: rotate(0);'}
  }
`;

export const StyledExpandedSelect = styled.div<{
  placement: `${ESelectPlacements}`;
}>`
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 300px;
  gap: 10px;
  padding: 10px 8px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 15px 25px rgba(30, 30, 30, 0.15),
    0px 5px 10px rgba(30, 30, 30, 0.05);
  border-radius: 12px;
  ${({ placement }) =>
    placement === ESelectPlacements.HEADER
      ? `
      top: 120%;
      left: -56%;
      width: 203px;
      
      `
      : ''}
  ${({ placement }) =>
    placement === ESelectPlacements.WIDGET
      ? `
      top: 110%;
      left: 0;
      width: 100%;
      text-align: center;
      `
      : ''}
`;

export const StyledInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  border: 0;
  padding: 0;

  white-space: nowrap;
  clip-path: inset(100%);
  clip: rect(0 0 0 0);
  overflow: hidden;
`;

export const StyledLabel = styled.label<{
  placement: `${ESelectPlacements}`;
  selected: boolean;
}>`
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 62px;
  font-size: 14px;
  ${({ placement, theme, selected }) =>
    placement === ESelectPlacements.HEADER
      ? `${
          selected
            ? `background-color: ${theme.colors.dashboardBackground};`
            : ''
        }`
      : `${selected ? `background-color: #ffebf1;` : ''}`}

  cursor: pointer;
  transition: background-color 250ms ease-out;
  &:hover {
    ${({ theme, placement }) =>
      placement === ESelectPlacements.HEADER
        ? `background-color: ${theme.colors.dashboardBackground}`
        : 'background-color: #ffebf1;'}
  }
`;

export const IconWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledKeyLabel = styled.div<{ primary: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 63px;
  height: 24px;
  padding: 0 8px;
  border-radius: 100px;
  font-size: 12px;
  ${({ primary }) =>
    primary
      ? `border: 1px solid #fad1dc; color: #ec4673;`
      : `border: 1px solid #F2EFFF; color: #43195B;`};
`;