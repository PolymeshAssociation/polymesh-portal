import styled from 'styled-components';

export const StyledInputContainer = styled.label`
  width: 100%;
`;
export const StyledInput = styled.input<{ $isBig?: boolean }>`
  outline: none;
  width: 100%;
  height: ${({ $isBig }) => ($isBig ? '46px' : '36px')};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 9px 16px;
  margin-top: 2px;
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: border-color ${({ theme }) => theme.transition.normal};

  &:focus {
    background: ${({ theme }) => theme.colors.cardBackground};
    border-color: ${({ theme }) => theme.colors.focusBorder};
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  & + p {
    margin-top: 2px;
    color: ${({ theme }) => theme.colors.error};
  }
`;
