import styled from 'styled-components';

export const StyledWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  & .notification {
    position: absolute;
    top: -6px;
    right: -6px;
  }
`;
