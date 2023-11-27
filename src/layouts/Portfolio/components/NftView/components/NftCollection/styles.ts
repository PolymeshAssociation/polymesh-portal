import styled from 'styled-components';

export const StyledCollectionContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 36px;
  @media screen and (max-width: 1572px) {
    flex-direction: column;
  }
`;

export const AssetDetailsCardWrapper = styled.div`
  flex: 0 0 45%;
  @media screen and (max-width: 1572px) {
    max-width: unset;
    width: 100%;
  }
`;

export const StyledLoaderWrapper = styled.div`
  flex: 2;
  @media screen and (max-width: 1572px) {
    flex: 4;
    width: 100%;
  }
`;

export const StyledListContainer = styled.div`
  flex: 4;
  @media screen and (max-width: 1572px) {
    width: 100%;
  }
`;
