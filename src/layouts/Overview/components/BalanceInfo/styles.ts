import styled from 'styled-components';

export const StyledWrapper = styled.div`
  grid-area: balance;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  border-radius: 24px;

  & .balance {
    display: flex;
    flex-direction: column;
    gap: 36px;
    margin-bottom: 36px;

    @media screen and (min-width: 768px) and (max-width: 1023px) {
      flex-direction: row;
      flex-wrap: wrap;

      & > div:first-child {
        width: 100%;
      }
    }
  }
  @media screen and (min-width: 1024px) {
    min-height: 392px;
  }

  @media screen and (max-width: 1200px) {
    width: 100%;
  }
`;

export const StyledTotalBalance = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  & h2 {
    flex-grow: 1;
  }
`;

export const StyledAsset = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  & button {
    flex-grow: 1;
  }

  @media screen and (min-width: 480px) {
    gap: 24px;
  }
`;
