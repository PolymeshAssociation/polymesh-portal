import styled from 'styled-components';

export const StyledWrapper = styled.div`
  grid-area: era-info;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  min-width: fit-content;
  justify-content: space-evenly;
  align-items: center;
  padding: 24px;
  gap: 16px;
  background: linear-gradient(252.2deg, #ff2e72 0%, #4a125e 111.15%);
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
  color: rgba(255, 255, 255, 0.82);

  & h4,
  & p {
    color: rgba(255, 255, 255, 0.82);
  }

  @media screen and (max-width: 1200px) {
    width: 100%;
  }
`;

export const StyledEraEpochWrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  gap: 16px;
  align-items: center;
`;

export const DetailsContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
`;

export const ElectionInfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: space-evenly;
  width: 100%;

  /* @media screen and (max-width: 1023px) {
    flex-direction: column;
  } */
`;

export const Label = styled.span`
  display: inline-block;
  min-width: 120px;
  font-size: 14px;
`;

export const Value = styled.span`
  display: inline-block;
  text-align: left;
  font-size: 14px;
`;

export const StyledElectionItem = styled.div`
  font-size: 12px;

  /* @media screen and (max-width: 1023px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
    font-size: 14px;

    & p {
      text-align: right;
      font-size: 14px;
    }
  } */

  @media screen and (max-width: 1200px) {
    font-size: 10px;
    & p {
      font-size: 14px;
    }
  }
`;
