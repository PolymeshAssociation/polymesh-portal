import styled from 'styled-components';

export const SelectWrapper = styled.div`
  position: relative;
`;

export const StyledSelect = styled.div<{
  $expanded: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  padding: 1px 12px 1px 16px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  cursor: pointer;
  & .expand-icon {
    transform: ${({ $expanded }) =>
      $expanded ? `rotate(180deg)` : `rotate(0)`};
  }
`;

export const StyledExpandedSelect = styled.div`
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  z-index: 1;
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
`;

export const SelectedOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  width: calc(100% - 24px);
`;

export const StyledSelectOption = styled(SelectedOption)`
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  &:not(:first-child) {
    margin-top: 8px;
  }
  &:hover {
    background-color: ${({ theme }) => theme.colors.dashboardBackground};
  }
`;

export const InputWrapper = styled.div`
  position: relative;
`;

export const StyledInput = styled.input`
  margin-bottom: 4px;
  outline: none;
  width: 100%;
  padding: 9px 40px 9px 16px;
  height: 36px;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  &:disabled {
    background-color: ${({ theme }) => theme.colors.dashboardBackground};
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledAccountAddress = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledPlaceholder = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

export const StyledError = styled.p`
  text-align: right;
  font-size: 12px;
  font-weight: 500;
  color: #db2c3e;
`;

export const StyledWarning = styled(StyledError)`
  color: rgb(255, 196, 12);
`;
