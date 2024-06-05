import styled from 'styled-components';

export const StyledWrapper = styled.div<{ $expanded: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  width: 40px;
  height: 40px;

  ${({ $expanded, theme }) =>
    $expanded
      ? `background-color: ${theme.colors.pinkBackground}; color: ${theme.colors.textPink};`
      : `background-color: transparent; color: ${theme.colors.textSecondary};`}

  transition: color 250ms ease-out, background-color 250ms ease-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightAccent};
  }

  & .notification {
    position: absolute;
    top: 2px;
    right: 2px;
  }
`;

export const StyledNotificationCenter = styled.div`
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  @media screen and (max-width: 767px) {
    top: 0;
    right: 0;
  }
`;
