import styled from 'styled-components';

export const OverviewGrid = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 36px;

  @media screen and (min-width: 1024px) {
    display: grid;
    align-items: stretch;
    grid-template-areas:
      'balance key'
      'balance did'
      'table table';
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: max-content;
  }
`;
