import styled from 'styled-components';

export const StyledCopyWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const StyledNotification = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: green;
`;
