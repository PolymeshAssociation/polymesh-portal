import styled from 'styled-components';

export const StyledButtonWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #8f8f8f;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textPink};
  opacity: 0.7;
  transition: opacity 250ms ease-out;
  &:hover {
    opacity: 1;
  }
`;
