import styled from 'styled-components';

export const StyledSecondaryKeyItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border-radius: 32px;
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};

  @media screen and (max-width: 767px) {
    padding: 18px;
    gap: 12px;
  }
`;

export const StyledInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  margin-bottom: 12px;

  @media screen and (max-width: 1023px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

export const KeyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
`;

export const KeyName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  word-break: break-word;

  @media screen and (max-width: 767px) {
    font-size: 16px;
  }
`;

export const KeyAddress = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
  word-break: break-all;

  @media screen and (max-width: 767px) {
    font-size: 13px;
  }
`;

export const KeyAddressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

export const KeyBalance = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 400;
  }

  @media screen and (max-width: 767px) {
    font-size: 13px;
  }
`;

export const StyledDetailsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;

  @media screen and (max-width: 1023px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const StyledDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const PermissionLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const StyledDetailValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  min-height: 32px;
  padding: 6px 12px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border-radius: 24px;
  width: fit-content;
`;

export const PermissionDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;
  auto-flow: column;
  grid-auto-flow: column;

  @media screen and (max-width: 1023px) {
    grid-template-columns: 1fr;
    gap: 16px;
    grid-auto-flow: row;
  }
`;

export const PermissionDetailItem = styled.div<{ $index: number }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  grid-column: ${({ $index }) => $index + 1};
  grid-row: auto;
  min-width: 0;

  @media screen and (max-width: 1023px) {
    grid-column: 1;
  }
`;

export const PermissionDetailLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const PermissionDetailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 250px;
  overflow-y: auto;
  min-width: 0;
  width: 100%;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.textSecondary};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.colors.textPrimary};
    }
  }
`;

export const PermissionDetailValue = styled.div`
  display: block;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border-radius: 24px;
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textPrimary};
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.5;
  min-height: auto;
`;

export const PortfolioDetailValueWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border-radius: 24px;
  width: 100%;
`;

export const PortfolioOwnerDid = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const PortfolioInfo = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textPrimary};
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
`;

export const StyledButtonsWrapper = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  & button {
    flex: 1;
    min-width: 100px;
  }

  & button:last-child {
    @media screen and (min-width: 1024px) {
      flex: 0 0 auto;
      width: initial;
    }
    & .expand-icon {
      transform: ${({ $expanded }) =>
        $expanded ? `rotate(180deg)` : `rotate(0)`};
    }
  }

  @media screen and (max-width: 1023px) {
    & button {
      flex: 1 1 calc(50% - 6px);
    }
    & button:last-child {
      flex: 0 1 auto;
      width: 100%;
    }
  }

  @media screen and (max-width: 767px) {
    gap: 10px;
    & button {
      flex: 1 1 calc(50% - 5px);
      font-size: 13px;
      padding: 8px 10px;
    }
    & button:last-child {
      flex: 0 1 100%;
    }
  }
`;
