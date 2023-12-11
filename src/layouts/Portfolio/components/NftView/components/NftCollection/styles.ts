import styled from "styled-components";
import { StyledInfoContainer, StyledInfo } from '../NftAsset/styles';

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