import styled from 'styled-components';

export const StyledButton = styled.button`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: -7px;
  right: -7px;
  width: 24px;
  height: 24px;
  background-color: #ffffff;
  border: 1px solid #e6e6e6;
  box-shadow: 0px 1px 3px rgba(30, 30, 30, 0.12),
    0px 1px 2px rgba(30, 30, 30, 0.24);
  border-radius: 50%;
  z-index: 1;

  & svg {
    width: 14px;
    height: 14px;
  }
`;
