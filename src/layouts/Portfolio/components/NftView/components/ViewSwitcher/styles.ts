import styled from 'styled-components';

export const StyledSwitcherWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

export const StyledIconWrapper = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  cursor: pointer;
  width: 40px;
  height: 40px;
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.pinkBackground : 'none'};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.textPink : theme.colors.textSecondary};
  transition: color 250ms ease-out;
  &:hover {
    color: ${({ theme }) => theme.colors.textPink};
  }
`;
