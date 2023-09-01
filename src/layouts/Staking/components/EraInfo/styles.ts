import styled from 'styled-components';

export const StyledWrapper = styled.div`
  grid-area: era-info;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  min-width: fit-content;
  min-height: 380px;
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

  @media screen and (max-width: 1199px) {
    width: 100%;
  }
`;

export const StyledEraEpochWrapper = styled.div<{
  $cardWidth: number;
}>`
  display: grid;
  grid-template-columns: ${({ $cardWidth }) =>
    $cardWidth < 420 ? 'auto auto' : 'auto auto auto'};
  column-gap: 10px;
  align-items: center;
  justify-content: ${({ $cardWidth }) =>
    $cardWidth < 420 ? 'space-between' : 'space-evenly'};
  width: 100%;

  & h4 {
    grid-column: ${({ $cardWidth }) =>
      $cardWidth < 420 ? '2 span' : '3 span'};
  }
`;

export const ElectionInfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  row-gap: 16px;
  justify-content: space-evenly;
  width: 100%;
`;

export const Label = styled.span`
  display: inline-block;
  font-size: 14px;
`;

export const Value = styled.span`
  display: inline-block;
  text-align: left;
  font-size: 14px;
`;

export const StyledElectionItem = styled.div`
  font-size: 12px;

  @media screen and (max-width: 1199px) {
    & p {
      font-size: 14px;
    }
  }
`;
export const EmptyRow = styled.span`
  grid-column: span 2;
  height: 48px;
`;
