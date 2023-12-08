import styled from 'styled-components';

export const StyledExpandableOperatorList = styled.div`
  position: relative;
  font-size: 12px;
`;

export const OperatorEntry = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  color: ${({ theme }) => theme.colors.textPrimary};

  & .copy-icon {
    color: ${({ theme }) => theme.colors.textSecondary};
    scale: 0.9;
  }
`;

export const StyledExpandable = styled.button<{
  $expanded?: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  pointer-events: auto;
  background: transparent;
  &:disabled {
    cursor: default;
  }

  & div {
    transition: transform 250ms ease-out;
    ${({ $expanded }) =>
      $expanded ? `transform: rotate(90deg);` : 'transform: rotate(0);'}
  }
`;

export const IconWrapper = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 16px;
`;

export const Label = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledOperatorList = styled.div<{
  $isMobile?: boolean;
}>`
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: auto;
  max-height: 300px;
  max-width: ${({ $isMobile }) => ($isMobile ? '275px' : '400px')};
  gap: 10px;
  padding: 10px 8px 10px 8px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: ${({ theme }) => `0px 15px 25px ${theme.colors.shadow},
    0px 5px 10px ${theme.colors.shadow}`};
  border-radius: 12px;
`;
