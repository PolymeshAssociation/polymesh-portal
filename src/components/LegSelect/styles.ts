import styled from 'styled-components';

export const StyledWrapper = styled.div`
  position: relative;
  padding: 16px;
  margin-top: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 16px;
`;

export const AssetWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 8px;

  & > div {
    width: 248px;
  }

  @media screen and (max-width: 767px) {
    flex-direction: column;
    & > div {
      width: 100%;
    }
  }
`;

export const FlexWrapper = styled(AssetWrapper)<{ marginBottom?: number }>`
  margin-bottom: ${({ marginBottom }) =>
    marginBottom ? `${marginBottom}px` : 0};
`;

export const StyledPlaceholder = styled.div<{ isAbsolute?: boolean }>`
  ${({ isAbsolute }) =>
    isAbsolute
      ? `
// position: absolute;
padding-top: 32px;



@media screen and (max-width: 767px) {
  position: static;
  padding: 0;
}

`
      : ''}
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

export const AssetSelectWrapper = styled.div`
  position: relative;
`;

export const StyledAssetSelect = styled.div<{
  expanded: boolean;
  isDisabled: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 12px 0 16px;
  background-color: ${({ theme, isDisabled }) =>
    isDisabled
      ? theme.colors.dashboardBackground
      : theme.colors.landingBackground};
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  cursor: pointer;
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'all')};

  & .expand-icon {
    transition: transform 250ms ease-out;
    transform: ${({ expanded }) => (expanded ? `rotate(180deg)` : `rotate(0)`)};
  }
`;

export const StyledExpandedSelect = styled.div`
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  max-height: 240px;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  z-index: 1;
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
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

export const IconWrapper = styled.div<{ background: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ background }) => background};
  color: #ffffff;
`;

export const InputWrapper = styled.div<{ marginBottom?: number }>`
  position: relative;
  margin-bottom: ${({ marginBottom }) =>
    marginBottom ? `${marginBottom}px` : 0};
  @media screen and (min-width: 768px) {
    height: 60px;
  }
`;

export const StyledLabel = styled.label`
  display: block;
  margin-bottom: 3px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
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

export const StyledAmountInput = styled(StyledInput)`
  padding: 9px 80px 9px 16px;
`;

export const StyledAvailableBalance = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StyledError = styled.p`
  position: absolute;
  top: 100%;
  right: 0;

  font-size: 12px;
  font-weight: 500;
  color: #db2c3e;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0;
  background-color: transparent;
  z-index: 1;
`;

export const UseMaxButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: transparent;
  color: #170087;
`;

export const StyledMemoLabel = styled.div<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  margin-bottom: ${({ expanded }) => (expanded ? '3px' : 0)};
  cursor: pointer;

  & .icon {
    transform: ${({ expanded }) => (expanded ? 'rotate(180deg)' : 'rotate(0)')};
  }
`;
