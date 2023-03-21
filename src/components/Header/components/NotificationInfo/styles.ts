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

  ${({ expanded, theme }) =>
    expanded
      ? `background-color: #FFEBF1; color: #FF2E72;`
      : `background-color: transparent; color: ${theme.colors.textSecondary};`}

  transition: color 250ms ease-out, background-color 250ms ease-out;

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
`;
