import styled from 'styled-components';

export const StyledWrapper = styled.div`
  grid-area: portfolio;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;

  @media screen and (max-width: 1023px) {
    width: 100%;
    height: auto;
  }

  @media screen and (min-width: 1024px) {
    & .details-bottom {
      display: flex;
      justify-content: space-between;
    }
  }
`;

export const StyledTopInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  & .info {
    flex-grow: 1;
  }

  @media screen and (max-width: 767px) {
    margin-bottom: 16px;
  }
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  min-height: 64px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.pinkBackground};
  color: ${({ theme }) => theme.colors.textPink};

  @media screen and (max-width: 1023px) {
    min-width: 48px;
    min-height: 48px;
  }
`;

export const StyledPortfolioInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.textPink};

  @media screen and (min-width: 1024px) and (max-width: 1200px) {
    font-size: 12px;
  }
`;

export const StyledDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;

  & span {
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media screen and (min-width: 1024px) and (max-width: 1200px) {
    font-size: 10px;
  }
`;

export const StyledButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  & button {
    flex-grow: 1;
  }
  margin-top: 16px;
  @media screen and (max-width: 767px) {
    margin: 16px 0 0 0;
  }
`;

export const StyledDeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  margin-left: auto;
  background-color: transparent;
  cursor: pointer;

  color: ${({ theme }) => theme.colors.textSecondary};

  &:disabled {
    color: #c7c7c7;
  }
`;
