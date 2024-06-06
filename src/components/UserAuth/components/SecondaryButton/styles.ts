import styled from 'styled-components';

export const StyledSecondaryButton = styled.button<{ $underlined: boolean }>`
  width: fit-content;
  color: ${({ theme }) => theme.colors.textPink};
  background: transparent;
  transition: color 250ms ease-out;
  &:hover {
    color: ${({ theme }) => theme.colors.textPurple};
  }
  & > p {
    text-decoration: ${({ $underlined }) =>
      $underlined ? 'underline' : 'none'};
  }
`;
