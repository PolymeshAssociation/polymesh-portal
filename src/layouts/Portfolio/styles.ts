import styled from 'styled-components';

export const PortfolioGrid = styled.div<{ $allAssets?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 36px;
  @media screen and (min-width: 1024px) {
    display: grid;
    grid-template-areas:
      'nav nav'
      ${({ $allAssets }) =>
        $allAssets ? `'assets assets'` : `'portfolio assets'`}
      'table table';
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: min-content;
  }
`;
