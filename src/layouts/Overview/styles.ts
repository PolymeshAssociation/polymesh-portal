import styled from 'styled-components';

export const OverviewGrid = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  gap: 36px;
  grid-template-areas:
    'balance key'
    'balance did';
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: max-content;
`;
