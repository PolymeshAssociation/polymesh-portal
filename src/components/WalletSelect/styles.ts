import styled, { css } from 'styled-components';
import { ESelectPlacements } from './types';

export const StyledSelectWrapper = styled.div<{
  $placement: `${ESelectPlacements}`;
}>`
  position: relative;
  cursor: pointer;
  ${({ $placement }) =>
    $placement === ESelectPlacements.HEADER
      ? `
      padding-right: 16px;
      max-width: 150px;

      `
      : ''}
  ${({ $placement }) =>
    $placement === ESelectPlacements.WIDGET
      ? `
      flex-grow: 1;
      background-color: rgba(255, 255, 255, 0.24);
      border-radius: 32px;

      `
      : ''}
`;

export const StyledSelect = styled.div<{
  $placement: `${ESelectPlacements}`;
  $expanded: boolean;
}>`
  font-weight: 500;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ $placement, theme }) =>
    $placement === ESelectPlacements.HEADER
      ? `
      color: ${theme.colors.textPrimary};
      text-align: center;

      & div {
        color: ${theme.colors.textPrimary};
      }
      `
      : ''}
  ${({ $placement }) =>
    $placement === ESelectPlacements.WIDGET
      ? `
      padding: 7px 28px 7px 8px;
      color: #ffffff;
      text-align: center;

      & div {
        right: 8px;
        color:  #ffffff;
      }
      `
      : ''}
    & div {
    transition: transform 250ms ease-out;
    ${({ $expanded }) =>
      $expanded ? `transform: rotate(90deg);` : 'transform: rotate(0);'}
  }
`;

export const StyledExpandedSelect = styled.div<{
  $placement: `${ESelectPlacements}`;
}>`
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 300px;
  gap: 6px;
  padding: 10px 8px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: ${({ theme }) => `0px 15px 25px ${theme.colors.shadow},
    0px 5px 10px ${theme.colors.shadow}`};
  border-radius: 12px;
  ${({ $placement }) =>
    $placement === ESelectPlacements.HEADER
      ? css`
          top: 120%;
          right: -56px;
          width: 400px;
          @media screen and (min-width: 768px) and (max-width: 1023px) {
            right: -46px;
            width: 300px;
          }
          @media screen and (max-width: 767px) {
            position: fixed;
            max-height: unset;
            top: 52px;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
            padding: 20px;
          }
        `
      : ''}

  ${({ $placement }) =>
    $placement === ESelectPlacements.WIDGET
      ? css`
          top: 110%;
          right: -40px;
          width: calc(100% + 40px);
          min-width: 300px;
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
  $placement: `${ESelectPlacements}`;
  selected?: boolean;
}>`
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${({ $placement }) =>
    $placement === ESelectPlacements.HEADER ? '48px' : '56px'};
  gap: 10px;
  padding: 12px 16px;
  border-radius: 62px;
  ${({ $placement, theme, selected }) =>
    $placement === ESelectPlacements.HEADER
      ? `${
          selected
            ? `background-color: ${theme.colors.dashboardBackground};`
            : ''
        }`
      : `${
          selected ? `background-color: ${theme.colors.pinkBackground};` : ''
        }`}

  & > span {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-size: ${({ $placement }) =>
      $placement === ESelectPlacements.HEADER ? '12px' : '14px'};
    max-width: calc(100% - 102px);

    & .meta {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    & .key {
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }

  cursor: pointer;
  transition: background-color 250ms ease-out;
  &:hover {
    ${({ theme, $placement }) =>
      $placement === ESelectPlacements.HEADER
        ? `background-color: ${theme.colors.dashboardBackground}`
        : `background-color: ${theme.colors.pinkBackground};`}
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

export const StyledKeyLabel = styled.div<{
  $primary?: boolean;
  $selectedId?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 100px;
  font-size: 12px;
  ${({ $primary, $selectedId, theme }) => {
    if ($primary) {
      if ($selectedId)
        return css`
          color: #ff2e72;
          font-weight: 500;
          background-color: #fad1dc;
        `;
      return css`
        border: 1px solid ${theme.colors.textPink};
        color: ${theme.colors.textPink};
      `;
    }
    if ($selectedId)
      return css`
        color: #170087;
        font-weight: 500;
        background-color: #dcd3ff;
      `;
    return css`
      border: 1px solid ${theme.colors.textBlue};
      color: ${theme.colors.textBlue};
    `;
  }}
`;

export const StyledFilter = styled.div`
  border: ${({ theme }) => `1px solid ${theme.colors.skeletonBase}`};
  margin: 0 10px;
  display: flex;
  padding: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledFilterInput = styled.input`
  font-size: 12px;
  border: none;
  width: 100%;
`;
