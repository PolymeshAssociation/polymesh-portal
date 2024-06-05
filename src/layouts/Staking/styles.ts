import styled from 'styled-components';

export const OverviewGrid = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-wrap: wrap;
  width: 100%;
  /* height: 100%; */
  gap: 36px;

  @media screen and (min-width: 1680px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
    gap: 36px;
    grid-template-areas:
      'account-info era-info'
      'staking-info staking-info '
      'table table';
    grid-auto-rows: max-content;
  }
`;
