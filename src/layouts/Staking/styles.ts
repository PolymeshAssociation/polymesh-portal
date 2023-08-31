import styled from 'styled-components';

export const OverviewGrid = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  height: 100%;
  gap: 16px;

  @media screen and (min-width: 1200px) {
    display: grid;
    grid-template-columns: minmax(468px, auto) minmax(350px, auto); //minmax(468px, auto) auto;
    align-items: stretch;
    gap: 16px;
    grid-template-areas:
      'account-info era-info '
      'staking-info staking-info '
      'table table';
    grid-auto-rows: max-content;
  }
`;
