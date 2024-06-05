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
  padding: 36px;
  gap: 36px;
  background: linear-gradient(245deg, #bd235d 10%, #000000 90%);
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
  color: rgba(255, 255, 255, 0.82);

  @media screen and (max-width: 860px) {
    padding: 24px;
    gap: 24px;
  }

  & h4,
  & p {
    color: rgba(255, 255, 255, 0.82);
  }
  & h4 {
    grid-column: span 2;
    @media screen and (max-width: 860px) {
      text-align: center;
      &:nth-child(2) {
        grid-row: 1;
        grid-column: span 2;
      }
      &:nth-child(13) {
        grid-row: 12;
        grid-column: span 2;
      }
    }
  }

  @media screen and (max-width: 1199px) {
    width: 100%;
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

export const StyledEraEpochWrapper = styled.div<{
  $cardWidth: number;
}>`
  display: grid;
  grid-template-columns: ${({ $cardWidth }) =>
    $cardWidth < 720 ? '1fr 1.5fr' : '170px 1fr 1fr'};
  column-gap: 72px;
  align-items: center;
  justify-content: ${({ $cardWidth }) =>
    $cardWidth < 720 ? 'space-evenly' : 'space-evenly'};
  width: 100%;

  @media screen and (max-width: 860px) {
    column-gap: 10px;
  }
`;

export const Label = styled.span`
  display: inline-block;
  font-size: 16px;
  @media screen and (max-width: 860px) {
    font-size: 14px;
    padding: 4px 0;
  }
`;

export const Value = styled.span`
  display: inline-block;
  text-align: right;
  font-size: 16px;
  @media screen and (max-width: 860px) {
    font-size: 14px;
    padding: 4px 0;
  }
`;

export const StyledElectionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;

  & p {
    font-size: 16px;
    font-weight: 600;
  }
  @media screen and (max-width: 860px) {
    font-size: 14px;
    & p {
      font-size: 14px;
      font-weight: 500;
    }
  }
`;

export const StyledElectionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  @media screen and (max-width: 580px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
  }
`;

export const EmptyRow = styled.span`
  grid-column: span 3;
  height: 56px;
  @media screen and (max-width: 860px) {
    grid-column: span 2;
    height: 40px;
  }
`;

export const StyledElectionRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  @media screen and (max-width: 440px) {
    flex-direction: column;
    gap: 24px;
  }
`;

export const StyledIconWrap = styled.div`
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.24);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  & svg {
    width: 28px;
    height: 28px;
  }
  @media screen and (max-width: 860px) {
    width: 40px;
    height: 40px;
    & svg {
      width: 24px;
      height: 24px;
    }
  }
`;

export const StyledIconRing = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  border-radius: 50%;
  & svg {
    width: 18px;
    height: 18px;
  }
  @media screen and (max-width: 860px) {
    width: 20px;
    height: 20px;
    & svg {
      width: 12px;
      height: 12px;
    }
  }
`;
