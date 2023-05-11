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
  background-color: ${({ theme }) => theme.colors.textPink};
  color: ${({ theme }) => theme.colors.pinkBackground};
  box-shadow: ${({ theme }) => `0px 1px 3px ${theme.colors.shadow},
    0px 1px 2px ${theme.colors.shadow}`};
  border-radius: 50%;
  z-index: 1;
  transition: transform 250ms ease;

  &:hover {
    transform: scale(1.05);
  }

  & svg {
    width: 14px;
    height: 14px;
  }
`;
