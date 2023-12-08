import styled from 'styled-components';

export const StyledOptionsContainer = styled.div`
  position: absolute;
  right: 0;
  z-index: 2;
  top: 65px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border-radius: 12px;
  padding: 10px 0;
  box-shadow:
    0px 5px 10px 0px rgba(30, 30, 30, 0.05),
    0px 15px 25px 0px rgba(30, 30, 30, 0.15);
`;

export const StyledOption = styled.div<{ $disabled: boolean }>`
  width: 245px;
  padding: 16px 24px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: ${({ $disabled }) => ($disabled ? '.8' : '1')};
  cursor: ${({ $disabled }) => ($disabled ? 'no-drop' : 'pointer')};
  transition: all 250ms ease-out;
  &:hover {
    background-color: ${({ theme, $disabled }) =>
      $disabled ? 'transparent' : theme.colors.dashboardBackground};
  }
`;
