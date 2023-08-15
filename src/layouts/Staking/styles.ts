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
    grid-template-columns: auto auto;
    align-items: center;
    gap: 16px;
    grid-template-areas:
      'account-info era-info '
      'staking-info staking-info '
      'table table';

    grid-auto-rows: max-content;
  }
`;
