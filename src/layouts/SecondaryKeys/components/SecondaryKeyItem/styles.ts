import styled from 'styled-components';

export const StyledSecondaryKeyItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border-radius: 32px;
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};

  @media screen and (max-width: 767px) {
    padding: 20px;
    gap: 16px;
  }
`;

export const StyledInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  margin-bottom: 24px;

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
  gap: 24px;
  padding: 24px;
  margin-bottom: 24px;
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
  gap: 24px;
  padding: 24px;
  margin-bottom: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;

  @media screen and (max-width: 1023px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const PermissionDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
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
`;

export const PermissionDetailValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 32px;
  padding: 6px 12px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border-radius: 24px;
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textPrimary};
  word-break: break-word;
`;

export const StyledButtonsWrapper = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 24px;

  & button {
    flex-grow: 1;
  }
  & button:last-child {
    width: 100%;
    @media screen and (min-width: 1024px) {
      width: initial;
      flex-grow: 0;
    }
    & .expand-icon {
      transform: ${({ $expanded }) =>
        $expanded ? `rotate(180deg)` : `rotate(0)`};
    }
  }

  @media screen and (max-width: 1023px) {
    flex-wrap: wrap-reverse;
  }
`;
