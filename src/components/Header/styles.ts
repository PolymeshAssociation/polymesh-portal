import styled from 'styled-components';

export const StyledHeader = styled.header`
  padding-top: 16px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};

  @media screen and (max-width: 767px) {
    padding-top: 0;
  }
`;

export const StyledHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;

  @media screen and (min-width: 768px) and (max-width: 1023px) {
    align-items: flex-start;
    height: auto;
    padding: 0 36px;
    & h2 {
      padding-top: 20px;
    }
  }
  @media screen and (min-width: 1200px) {
    height: 72px;
    padding: 0 48px;
  }
`;

export const StyledInfoList = styled.ul`
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  @media screen and (max-width: 767px) {
    margin-left: auto;
  }

  @media screen and (max-width: 1023px) {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

export const StyledInfoItem = styled.li`
  display: flex;
  align-items: center;
  gap: 16px;

  @media screen and (min-width: 768px) and (max-width: 1023px) {
    gap: 8px;
  }

  &:not(:first-child) {
    margin-left: 16px;

    @media screen and (min-width: 768px) and (max-width: 1023px) {
      margin-left: 8px;
    }
  }

  &:not(:last-child)::after {
    content: '';
    width: 2px;
    height: 32px;
    background-color: ${({ theme }) => theme.colors.lightAccent};
  }
`;

export const StyledIconGroup = styled.div`
  display: flex;
  align-items: center;
  margin-left: 8px;
`;

export const StyledCloseMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StyledConnectWalletSpan = styled.span`
  color: ${({ theme }) => theme.colors.textPink};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.textPurple};
  }
`;
