import styled, { css } from 'styled-components';

export const StyledLabel = styled.button`
  position: relative;
  display: flex;
  height: 24px;
  padding: 0 4px;
  background-color: inherit;
  color: inherit;
  cursor: pointer;
`;

export const TooltipContainer = styled.div<{
  $expanded: boolean;
  $position: string;
  $maxWidth: number;
}>`
  position: absolute;
  padding: 4px 8px;
  margin: 6px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 10px;
  border-radius: 4px;
  max-width: ${({ $maxWidth }) => `${$maxWidth}px`};
  width: max-content;
  white-space: normal;
  text-align: left;
  box-shadow: ${({ theme }) => `0px 15px 25px ${theme.colors.shadow},
    0px 5px 10px ${theme.colors.shadow}`};
  opacity: ${({ $expanded }) => ($expanded ? 1 : 0)};
  z-index: ${({ $expanded }) => ($expanded ? 1 : -1)};
  transition: opacity 0.3s ease-in;

  ${({ $expanded }) =>
    !$expanded &&
    css`
      visibility: hidden;
      pointer-events: none;
    `}

  // Element used to create speech bubble effect
  &::before {
    content: '';
    position: absolute;
    border-style: solid;
    border-width: 6px;
  }

  // Conditionally apply styling based to correctly locate based
  // on selected position
  ${({ $position }) => {
    switch ($position) {
      case 'top-left':
        return css`
          top: auto;
          bottom: 100%;
          right: -6px;
          &::before {
            border-color: ${({ theme }) => theme.colors.dashboardBackground}
              transparent transparent transparent;
            bottom: -12px;
            left: calc(100% - 18px);
          }
        `;
      case 'top':
        return css`
          top: auto;
          bottom: 100%;
          left: 12px;
          transform: translateX(calc(-50% - 6px));
          &::before {
            border-color: ${({ theme }) => theme.colors.dashboardBackground}
              transparent transparent transparent;
            bottom: -12px;
            left: calc(50% - 6px);
          }
        `;
      case 'top-right':
        return css`
          top: auto;
          bottom: 100%;
          left: -6px;
          &::before {
            border-color: ${({ theme }) => theme.colors.dashboardBackground}
              transparent transparent transparent;
            bottom: -12px;
            left: 6px;
          }
        `;
      case 'left':
        return css`
          top: 50%;
          bottom: auto;
          right: 100%;
          transform: translateY(calc(-50% - 6px));
          &::before {
            border-color: transparent transparent transparent
              ${({ theme }) => theme.colors.dashboardBackground};
            right: -12px;
            top: calc(50% - 6px);
          }
        `;
      case 'right':
        return css`
          top: 50%;
          bottom: auto;
          left: 100%;
          transform: translateY(calc(-50% - 6px));
          &::before {
            border-color: transparent
              ${({ theme }) => theme.colors.dashboardBackground} transparent
              transparent;
            top: calc(50% - 6px);
            left: -12px;
          }
        `;
      case 'bottom-left':
        return css`
          top: 100%;
          bottom: auto;
          right: -6px;
          &::before {
            border-color: transparent transparent
              ${({ theme }) => theme.colors.dashboardBackground} transparent;
            top: -12px;
            left: calc(100% - 18px);
          }
        `;
      case 'bottom':
        return css`
          top: 100%;
          bottom: auto;
          left: 12px;
          transform: translateX(calc(-50% - 6px));
          &::before {
            border-color: transparent transparent
              ${({ theme }) => theme.colors.dashboardBackground} transparent;
            top: -12px;
            left: calc(50% - 6px);
          }
        `;
      case 'bottom-right':
      default:
        return css`
          top: 100%;
          bottom: auto;
          left: -6px;
          &::before {
            border-color: transparent transparent
              ${({ theme }) => theme.colors.dashboardBackground} transparent;
            top: -12px;
            left: 6px;
          }
        `;
    }
  }}
`;
