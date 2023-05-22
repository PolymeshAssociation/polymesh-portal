import styled from 'styled-components';

export const StyledValue = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  text-transform: capitalize;
`;

export const StyledButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 48px;
  @media screen and (min-width: 768px) {
    width: 440px;
  }
`;

export const StyledWalletWrapper = styled.div`
  padding: 16px 24px 24px 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;

  &:not(:first-child) {
    margin-top: 16px;
  }

  @media screen and (min-width: 768px) {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }
`;

export const StyledActionButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StyledActionButton = styled.button<{ marginTop?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  gap: 8px;
  margin-top: ${({ marginTop }) => (marginTop ? `${marginTop}px` : 0)};
  padding: 0 16px;
  background-color: transparent;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textBlue};

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`;

export const InputWrapper = styled.div`
  position: relative;
  flex-grow: 1;
  margin-bottom: 16px;
  @media screen and (min-width: 768px) {
    margin-bottom: 0;
    margin-right: 24px;
  }
`;

export const StyledInput = styled.input`
  outline: none;
  width: 100%;
  height: 36px;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  padding: 9px 16px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledLabel = styled.label`
  display: block;
  margin-bottom: 3px;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StyledErrorMessage = styled.span`
  position: absolute;
  top: 100%;
  left: 0;
  font-size: 12px;
  font-weight: 500;
  color: #db2c3e;
`;
