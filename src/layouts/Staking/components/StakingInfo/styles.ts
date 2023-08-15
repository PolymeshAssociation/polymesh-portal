import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  grid-area: staking-info;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
  height: 100%;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
  gap: 16px;

  @media screen and (min-width: 768px) and (max-width: 1023px) {
    flex-direction: row;
    flex-wrap: wrap;
  }

  @media screen and (max-width: 1200px) {
    width: 100%;
  }

  & button {
    width: 100%;
  }
`;

export const StyledAsset = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;
