import styled from 'styled-components';

export const StyledInputContainer = styled.label`
  width: 100%;
`;
export const StyledInput = styled.input<{ $isBig?: boolean }>`
  outline: none;
  width: 100%;
  height: ${({ $isBig }) => ($isBig ? '46px' : '36px')};
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  padding: 9px 16px;
  margin-top: 2px;
  background: ${({ theme }) => theme.colors.landingBackground};

  &:focus {
    background: ${({ theme }) => theme.colors.landingBackground};
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  & + p {
    margin-top: 2px;
    color: #db2c3e;
  }
`;
