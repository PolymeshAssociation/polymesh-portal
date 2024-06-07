import styled from 'styled-components';

export const StyledExtensionList = styled.ul`
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(4, 205px);
  gap: 16px;
  @media screen and (max-width: 920px) {
    grid-template-columns: repeat(2, 205px);
    justify-content: center;
  }
  @media screen and (max-width: 520px) {
    grid-template-columns: repeat(2, 160px);
    gap: 12px;
  }
`;

export const StyledExtensionBox = styled.li`
  position: relative;
  height: 235px;
  cursor: pointer;
  @media screen and (max-width: 520px) {
    height: 212px;
  }
`;
