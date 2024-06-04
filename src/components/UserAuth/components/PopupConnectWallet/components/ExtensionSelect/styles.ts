import styled from 'styled-components';

export const StyledExtensionList = styled.ul`
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(4, 205px);
  gap: 16px;
`;

export const StyledExtensionBox = styled.li`
  position: relative;
  height: 235px;
  cursor: pointer;
`;
