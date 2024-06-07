import styled from 'styled-components';

export const StyledProvidersContainer = styled.ul`
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 16px;
  @media screen and (max-width: 1040px) {
    grid-template-columns: auto auto;
  }
  @media screen and (max-width: 680px) {
    grid-template-columns: auto;
  }
`;

export const StyleProviderBox = styled.li`
  position: relative;
`;
