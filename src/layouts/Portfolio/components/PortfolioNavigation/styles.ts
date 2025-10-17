import styled from 'styled-components';

export const StyledNavBar = styled.div`
  grid-area: nav;
  display: flex;
  align-items: center;
  gap: 24px;

   .skeleton-wrapper {
    width: auto !important;
  }

  @media screen and (max-width: 1023px) {
    width: 100%;
  }
`;

export const StyledSelectWrapper = styled.div`
  flex-grow: 1;
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
  transition:
    color 250ms ease-out,
    border 250ms ease-out;

  &.active {
    border: 1px solid #c7c7c7;
    border-bottom: 1px solid transparent;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const AddPortfolioButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: auto;
  min-width: unset; /* allow our fixed width */
  padding: 0 16px;
  font-weight: 500;
  font-size: 14px;

  @media screen and (max-width: 1023px) {
    width: 48px;
    padding: 0;
  }
`;

export const AddPortfolioMobile = styled(AddPortfolioButton)`
  position: absolute;
  top: -64px;
  right: -8px;
  border-radius: 50%;
`;
