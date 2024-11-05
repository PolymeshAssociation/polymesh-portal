import styled from 'styled-components';

export const StyledAssetForm = styled.div`
  position: relative;
  margin-top: 24px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  padding: 16px 16px 24px;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 12px;
  padding: 0;
  background-color: transparent;
  @media screen and (max-width: 768px) {
    top: 22px;
  }
`;

export const StyledSelectControls = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  width: 410px;
  margin-bottom: 24px;
`;

export const StyledDropdownWrapper = styled.div<{ $index: number }>`
  margin-bottom: 12px;
  margin-right: ${({ $index }) => ($index > 0 ? '24px' : '0')};
`;

export const StyledSelectBtn = styled.div`
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

export const StyledPlaceholder = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

export const SelectWrapper = styled.div`
  position: relative;
`;

export const StyledSelect = styled.div<{
  $expanded: boolean;
  $disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  padding: 1px 12px 1px 16px;
  background-color: ${({ theme, $disabled }) =>
    !$disabled && theme.colors.landingBackground};
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
  scroll-behavior: auto;
`;

export const SelectedOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
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

export const StyledMemoLabel = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  margin-bottom: ${({ $expanded }) => ($expanded ? '3px' : 0)};
  cursor: pointer;

  & .icon {
    transform: ${({ $expanded }) =>
      $expanded ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;
export const StyledInput = styled.input`
  outline: none;
  width: 100%;
  padding: 9px 16px;
  height: 36px;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledError = styled.p`
  text-align: right;
  font-size: 12px;
  font-weight: 500;
  color: #db2c3e;
`;
