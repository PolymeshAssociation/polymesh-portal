import styled from 'styled-components';

export const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: #170087;
  border-radius: 50%;
  background-color: transparent;
  padding: 0;

  &:hover {
    background-color: #170087;
    color: ${({ theme }) => theme.colors.landingBackground};
    box-shadow: 0px 24px 24px rgba(23, 0, 135, 0.12);
  }

  &:active {
    box-shadow: 0px 12px 24px transparent;
  }

  transition-property: color, background-color, box-shadow;
  transition-duration: 250ms;
  transition-timing-function: ease-out;
`;
