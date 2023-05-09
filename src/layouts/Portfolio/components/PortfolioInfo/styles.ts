import styled from 'styled-components';

export const StyledWrapper = styled.div`
  grid-area: portfolio;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  padding: 24px;
  height: 196px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
`;

export const StyledTopInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  & .info {
    flex-grow: 1;
  }
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.pinkBackground};
  color: ${({ theme }) => theme.colors.textPink};
`;

export const StyledPortfolioInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.textPink};
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
`;

export const StyledButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  & button {
    flex-grow: 1;
  }
`;
