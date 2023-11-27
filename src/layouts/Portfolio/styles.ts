import styled from 'styled-components';

export const PortfolioGrid = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 36px;
`;

export const StyledAllocation = styled.div`
  display: flex;
  gap: 36px;
  & > div {
    flex: 1;
  }
  @media screen and (max-width: 1024px) {
    flex-direction: column;
  }
`;
