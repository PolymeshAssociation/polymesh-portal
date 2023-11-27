import styled from 'styled-components';

export const StyledAddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  margin-bottom: 32px;
  height: 40px;
  padding: 0 16px;
  background-color: transparent;
  color: #170087;

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`;

export const StyledButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
`;

export const StyledAssetSelect = styled.div`
  margin-top: 24px;
  border-top-right-radius: 16px;
  border-top-left-radius: 16px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 16px 16px 8px;
`;

export const StyledAssetSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  cursor: pointer;
  &:not(:last-child)::after {
    content: '';
    display: block;
    width: 1px;
    background: ${({ theme }) => theme.colors.shadow};
    position: absolute;
    top: 0;
    bottom: 0;
    right: -16px;
  }
`;
