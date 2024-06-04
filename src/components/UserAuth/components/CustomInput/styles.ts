import styled from 'styled-components';

export const StyledInputContainer = styled.label`
  width: 100%;
`;
export const StyledInput = styled.input`
  outline: none;
  width: 100%;
  height: 36px;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  padding: 9px 16px;
  margin-top: 2px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
