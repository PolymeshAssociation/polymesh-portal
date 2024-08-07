import styled from 'styled-components';

export const StyledWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  width: 40px;
  height: 40px;

  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightAccent};
  }

  transition:
    color 250ms ease-out,
    background-color 250ms ease-out;
`;
