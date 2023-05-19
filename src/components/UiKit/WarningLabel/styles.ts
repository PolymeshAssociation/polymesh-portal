import styled from 'styled-components';

export const StyledLabel = styled.button<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ isExpanded }) => (isExpanded ? 'max-content' : '24px')};
  height: 24px;
  padding: 0 4px;
  gap: 4px;
  background-color: #fbf3d0;
  color: #e3a30c;
  font-size: 10px;
  font-weight: 500;
  border-radius: 100px;
  text-indent: ${({ isExpanded }) => (isExpanded ? 0 : '-300px')}

  transition: width 250ms ease-out, text-indent 250ms ease-out;
`;
