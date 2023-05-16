import styled from 'styled-components';

export const StyledSelectionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  @media screen and (max-width: 767px) {
    justify-content: center;
  }
`;

export const SelectAllButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-radius: 100px;
  padding: 0 16px;
  background-color: transparent;
  border: 1px solid transparent;
  color: #170087;

  transition: border 250ms ease-out, box-shadow 250ms ease-out;

  &:hover:enabled {
    border: 1px solid #170087;
  }
  &:active:enabled {
    box-shadow: 0px 24px 24px rgba(23, 0, 135, 0.12);
  }

  &:disabled {
    color: #c7c7c7;
  }

  @media screen and (max-width: 1023px) {
    padding: 0 8px;
  }
`;

export const StyledSelected = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  & > span {
    margin-left: 4px;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &::before {
    content: '';
    margin-right: 16px;
    width: 1px;
    height: 32px;
    background-color: #e6e6e6;
  }
`;

export const StyledTransfersList = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 36px;
`;

export const StyledButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  &::before {
    content: '';
    margin-right: 16px;
    width: 1px;
    height: 32px;
    background-color: #e6e6e6;
  }
`;
export const StyledActionButton = styled.button<{ isReject?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  height: 32px;
  border-radius: 100px;
  background-color: ${({ isReject }) => (isReject ? '#ff2e72' : '#60d3cb')};
  color: #ffffff;
  box-shadow: 0px 1px 3px rgba(30, 30, 30, 0.12),
    0px 1px 2px rgba(30, 30, 30, 0.24);
  transition: background-color 250ms ease-out, color 250ms ease-out;

  &:not(:first-child) {
    margin-left: 24px;
  }

  &:disabled {
    background-color: #f0f0f0;
    color: #8f8f8f;
  }
`;

export const ClearSelectionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  padding: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.textSecondary};
  color: #ffffff;
`;

export const TransfersPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 162px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  border-radius: 32px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
