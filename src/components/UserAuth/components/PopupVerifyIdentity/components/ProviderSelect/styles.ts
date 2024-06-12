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

export const StyleProviderBox = styled.li`
  position: relative;
`;
