import styled from 'styled-components';

export const StyledDateTimeCell = styled.span`
  display: inline-flex;
  gap: 4px;
  flex-wrap: wrap;
  @media screen and (min-width: 1200px) {
    min-width: 200px;
  }
`;

export const StyledTime = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;
