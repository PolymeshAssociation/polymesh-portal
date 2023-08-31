import styled from 'styled-components';

export const StyledLabel = styled.button<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: left;
  width: ${({ $expanded }) => ($expanded ? `215px` : '24px')};
  height: 24px;
  padding: 0 4px;
  gap: 4px;
  background-color: #fbf3d0;
  color: #e3a30c;
  font-size: 10px;
  font-weight: 500;
  border-radius: 100px;
  white-space: nowrap;
  overflow: hidden;
  min-width: 24px;
  transition: width 250ms ease;
`;
