import styled from 'styled-components';

export const StyledNavBar = styled.div`
  grid-area: nav;
  display: flex;
  align-items: center;
`;

export const StyledNavList = styled.ul`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

export const StyledNavLink = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 24px;
  background-color: transparent;
  border-radius: 12px 12px 0 0;
  font-weight: 500;
  font-size: 14px;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: capitalize;
  transition: color 250ms ease-out, border 250ms ease-out;

  &.active {
    border: 1px solid #c7c7c7;
    border-bottom: 1px solid transparent;
    color: #000000;
  }
`;

export const AddPortfolioButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 173px;
  height: 48px;
  gap: 10px;
  background-color: transparent;
  font-weight: 500;
  font-size: 14px;
  color: #ff2e72;
`;
