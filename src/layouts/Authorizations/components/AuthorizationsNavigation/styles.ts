import styled from 'styled-components';

export const StyledNavBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 60px;
  gap: 24px;
`;

export const StyledSelectWrapper = styled.div`
  position: relative;
  flex-grow: 1;
  & div {
    text-transform: capitalize;
    & button {
      text-transform: capitalize;
    }
  }

  & .notification-counter {
    position: absolute;
    top: 12px;
    left: 88px;
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
`;
