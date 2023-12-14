import styled from "styled-components";
import { StyledInfoContainer, StyledInfo, StyledInfoBlockHead } from '../NftAsset/styles';

export const StyledCollectionContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 36px;
  @media screen and (max-width: 1572px) {
    flex-direction: column;
  }
`;

export const StyledDetailsContainer = styled(StyledInfoContainer)`
  flex: 1;
  @media screen and (max-width: 1572px) {
    flex: 2;
    width: 100%;
  }
`;

export const StyledLoaderWrapper = styled.div`
  flex: 1;
  @media screen and (max-width: 1572px) {
    flex: 2;
    width: 100%;
  }
`

export const StyledListContainer = styled.div`
  flex: 2;
  @media screen and (max-width: 1572px) {
    width: 100%;
  }
`;

export const StyledInfoWrap = styled(StyledInfo)`
  max-height: calc(100vh - 388px);
`;

export const StyledTooltipWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const StyledInfoBlockContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const StyledInfoHeaderWrap = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  & .expand-icon {
    cursor: pointer;
    transform: ${({ $expanded }) =>
      $expanded ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

export const StyledBlockHeaderCapitalized = styled(StyledInfoBlockHead)`
  text-transform: capitalize;
`;

export const StyledTooltipsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
`;