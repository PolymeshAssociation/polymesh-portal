import styled from 'styled-components';

export const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.textPink};
  &:hover {
    color: ${({ theme }) => theme.colors.textPurple};
  }
`;

export const StyledInfoContainer = styled.div`
  max-width: 675px;
`;
