import styled from 'styled-components';

export const StyledWrapper = styled.label<{ $installed?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 26px;
  width: 136px;
  height: 136px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border: 1px solid transparent;
  border-radius: 32px;
  cursor: pointer;

  transition: border 250ms ease-out;
`;

export const StyledWalletIconBox = styled.div<{ $installed?: boolean }>`
  & svg {
    opacity: ${({ $installed }) => ($installed ? 1 : 0.6)};
  }
`;

export const StyledStatusIconBox = styled.div`
  position: absolute;
  top: 24px;
  right: 32px;
`;

export const StyledSelectedIconBox = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
`;

export const StyledCaption = styled.span<{ $installed?: boolean }>`
  color: ${({ $installed, theme }) =>
    $installed ? theme.colors.textPrimary : theme.colors.textSecondary};
`;
