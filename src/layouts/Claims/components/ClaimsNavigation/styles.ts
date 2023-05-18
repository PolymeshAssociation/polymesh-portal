import styled from 'styled-components';

export const StyledNavBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 60px;

  @media screen and (max-width: 767px) {
    gap: 24px;
    margin-bottom: 24px;
    & > div:first-child {
      flex-grow: 1;
      text-transform: capitalize;
      & button {
        text-transform: capitalize;
      }
    }
  }
`;

export const StyledNavList = styled.ul`
  display: flex;
  align-items: center;
`;

export const StyledNavLink = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
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

export const StyledActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  @media screen and (min-width: 768px) and (max-width: 1199px) {
    gap: 16px;
  }
`;

export const StyledSort = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin-bottom: 24px;

  @media screen and (min-width: 768px) and (max-width: 1023px) {
    margin-bottom: 0;
    flex-direction: column;
    align-items: flex-start;
  }

  @media screen and (min-width: 1024px) {
    align-items: center;
    margin-bottom: 0;
    &::after {
      content: '';
      display: block;
      width: 1px;
      height: 32px;
      margin-left: 24px;
      background-color: #e6e6e6;
      @media screen and (max-width: 1199px) {
        margin-left: 16px;
      }
    }
  }
`;

export const StyledSortSelect = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-left: 2px;
  padding-left: 2px;
  padding-right: 16px;
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    margin-left: 0;
    padding-left: 0;
  }

  & .dropdown-icon {
    position: absolute;
    top: -5%;
    right: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  & select {
    position: relative;
    z-index: 1;
    appearance: none;
    display: flex;
    align-items: flex-end;
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: none;
    outline: none;
    font-size: 14px;
  }
`;
