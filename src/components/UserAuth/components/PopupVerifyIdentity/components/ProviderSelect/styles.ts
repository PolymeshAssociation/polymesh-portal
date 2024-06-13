import styled from 'styled-components';

export const StyledProvidersContainer = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  @media screen and (max-width: 1040px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media screen and (max-width: 680px) {
    grid-template-columns: auto;
  }
`;

export const StyledTestnetContainer = styled.div`
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 680px) {
    flex-direction: column;
  }
`;

export const StyledTestnetList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media screen and (max-width: 680px) {
    margin-top: 24px;
  }
`;

export const StyleProviderBox = styled.li`
  position: relative;
`;
