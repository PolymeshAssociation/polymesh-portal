import styled from 'styled-components';

export const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: ${({ theme }) => theme.colors.textBlue};
  border-radius: 50%;
  border: 1px solid transparent;
  background-color: transparent;
  padding: 0;

  transition: border 250ms ease-out, box-shadow 250ms ease-out,
    color 250ms ease-out;

  &:hover:enabled {
    border: 1px solid ${({ theme }) => theme.colors.textBlue};
  }
  &:active:enabled {
    box-shadow: 0px 24px 24px ${({ theme }) => theme.colors.shadow};
  }
  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`;
