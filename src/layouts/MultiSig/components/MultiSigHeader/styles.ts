import styled from 'styled-components';

export const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap-reverse;
  gap: 16px;
  @media screen and (max-width: 767px) {
    flex-direction: column;
    margin-bottom: 24px;
    & > div:first-child {
      min-width: 332px;
      text-transform: capitalize;
      & button {
        text-transform: capitalize;
      }
    }
  }
`;

export const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;

  @media screen and (max-width: 767px) {
    flex-wrap: wrap-reverse;
    margin-left: 0;
    gap: 16px;
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
  transition:
    color 250ms ease-out,
    border 250ms ease-out;
  &.active {
    border: 1px solid #c7c7c7;
    border-bottom: 1px solid transparent;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const StyledLabelWrapper = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  gap: 4px;
  &:not(:last-child) {
    padding: 5px 24px;
    @media screen and (min-width: 768px) {
      border-right: 1px solid #e6e6e6;
    }
  }
  &:last-child {
    padding: 5px 0px 5px 24px;
  }
`;

export const StyledSigners = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StyledMultisig = styled.span`
  color: ${({ theme }) => theme.colors.textPink};
`;

export const StyledSort = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 68px;
  margin-left: 2px;
  padding-left: 2px;

  & .dropdown-icon {
    position: absolute;
    top: -5%;
    right: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  & select {
    position: relative;
    /* z-index: 1; */
    appearance: none;
    display: flex;
    align-items: flex-end;
    width: 100%;
    height: 100%;
    background-color: transparent;
    border: none;
    outline: none;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textPrimary};
    cursor: pointer;
  }

  & .options {
    background-color: ${({ theme }) => theme.colors.modalBackground};
  }
`;

export const StyledButtonsWrapper = styled.div`
  padding-left: 16px;
`;
