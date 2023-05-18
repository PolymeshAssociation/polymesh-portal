import styled from 'styled-components';

export const StyledScrollableWrapper = styled.div`
  padding: 24px 12px 24px 0;
  max-height: 60vh;
  overflow-y: scroll;

  @media screen and (max-width: 767px) {
    max-height: calc(100% - 116px);
  }
`;

export const StyledButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
`;

export const StyledInputWrapper = styled.div<{
  marginBottom?: number;
  marginTop?: number;
}>`
  position: relative;
  margin-bottom: ${({ marginBottom }) =>
    marginBottom ? `${marginBottom}px` : 0};
  margin-top: ${({ marginTop }) => (marginTop ? `${marginTop}px` : 0)};
`;

export const StyledLabel = styled.label`
  display: inline-block;
  margin-bottom: 3px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StyledInput = styled.input`
  outline: none;
  width: 100%;
  padding: 9px 16px;
  height: 36px;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.textPrimary};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledErrorMessage = styled.span`
  position: absolute;
  top: 100%;
  left: 0;
  font-size: 12px;
  font-weight: 500;
  color: #db2c3e;
`;
