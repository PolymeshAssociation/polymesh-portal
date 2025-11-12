import styled from 'styled-components';

export const StyledNavWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 36px;

  @media screen and (max-width: 767px) {
    margin-bottom: 24px;
  }
`;

export const StyledNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 24px;
  height: 48px;

  @media screen and (max-width: 767px) {
    width: 100%;
    gap: 12px;
  }
`;

export const StyledNavItem = styled.button<{ $isActive: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: ${({ $isActive }) => ($isActive ? '500' : '400')};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.textPrimary : theme.colors.textSecondary};
  cursor: pointer;
  transition: color 250ms ease-out;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.textPrimary};
    transform: scaleX(${({ $isActive }) => ($isActive ? 1 : 0)});
    transition: transform 250ms ease-out;
  }

  @media screen and (max-width: 767px) {
    flex: 1;
    justify-content: center;
    font-size: 14px;
  }
`;

export const StyledBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background-color: ${({ theme }) => theme.colors.textPink};
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.buttonText};
`;
