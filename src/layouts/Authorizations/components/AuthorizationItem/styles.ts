import styled from 'styled-components';

export const StyledItemWrapper = styled.li`
  width: 100%;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 32px;
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

export const StyledInfoItem = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media screen and (max-width: 1023px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
    & p {
      text-align: right;
    }
  }

  @media screen and (min-width: 1024px) and (max-width: 1199px) {
    font-size: 10px;
    & p {
      font-size: 14px;
      text-align: right;
    }
  }
`;

export const StyledDetailsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px;
  margin-bottom: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;

  @media screen and (max-width: 1023px) {
    flex-direction: column;
  }
`;

export const StyledDetailItem = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media screen and (min-width: 1024px) {
    flex-wrap: nowrap;
    &:not(:last-child)::after {
      content: '';
      display: block;
      width: 1px;
      height: 32px;
      margin-left: 8px;
      background-color: #e6e6e6;
    }
  }
`;

export const StyledDetailValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 32px;
  padding: 6px 12px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border-radius: 24px;
`;

export const StyledButtonsWrapper = styled.div<{ expanded: boolean }>`
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
      transform: ${({ expanded }) =>
        expanded ? `rotate(180deg)` : `rotate(0)`};
    }
  }

  @media screen and (max-width: 1023px) {
    flex-wrap: wrap-reverse;
  }
`;

export const StyledLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 16px;
  background-color: #170087;
  border-radius: 100px;
  color: #ffffff;
  font-weight: 500;
  font-size: 12px;
`;

export const StyledTextWithCopy = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 500;
  font-size: 16px;
`;

export const StyledExpiryTime = styled.span`
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
