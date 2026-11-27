import styled from 'styled-components';

export const StyledDateTimeCell = styled.span<{ $compact?: boolean }>`
  display: inline-flex;
  gap: 4px;
  flex-wrap: ${({ $compact }) => ($compact ? 'nowrap' : 'wrap')};
  white-space: ${({ $compact }) => ($compact ? 'nowrap' : 'normal')};
  @media screen and (min-width: 1200px) {
    min-width: ${({ $compact }) => ($compact ? '0' : '200px')};
  }
`;

export const StyledTime = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;
