import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  grid-area: account-info;
  flex-direction: column;
  justify-content: space-between;
  padding: 36px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
  gap: 36px;
  min-height: 310px;

  @media screen and (max-width: 1440px) {
    width: 100%;
  }
  @media screen and (max-width: 860px) {
    padding: 24px;
  }

  & .skeleton-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    > br {
      display: none;
    }
  }

  & .react-loading-skeleton {
    flex: 1;
  }
`;

export const StyledButtonWrapper = styled.div<{ $cardWidth?: number }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 12px;
  flex-direction: ${({ $cardWidth }) =>
    $cardWidth && $cardWidth < 500 ? 'column' : 'row'};
  & button {
    &:not(:nth-of-type(3)) {
      width: 100%;
    }
    &:nth-of-type(3) {
      min-width: 56px;
    }
  }
`;

export const IconWrapper = styled.div<{ $size?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => $size || '32px'};
  height: ${({ $size }) => $size || '32px'};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.pinkBackground};

  & .staking-icon,
  & .id-icon {
    color: ${({ theme }) => theme.colors.textPink};
  }
  & .copy-icon {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledModalContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const StyledTopInfo = styled.div`
  position: relative;
  display: flex;
  align-content: center;
  justify-content: center;
  gap: 12px;

  & .heading-wrapper {
    align-items: center;
    display: flex;
    flex-grow: 1;
  }
`;

export const StyledTextWrapper = styled.div`
  padding: 30px 0px;
`;

export const StyledMessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const StyledStakingMessage = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: rgb(255, 196, 12);

  .alert-icon {
    width: 24px;
    vertical-align: middle;
  }
`;

export const StyledLink = styled.a`
  display: inline-block;
  font-weight: 600;
  text-decoration: underline;
`;
