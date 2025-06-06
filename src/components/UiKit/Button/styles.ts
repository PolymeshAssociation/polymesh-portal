import styled, { css } from 'styled-components';
import { EButtonVariants } from './types';

export const StyledButton = styled.button<{
  $variant: `${EButtonVariants}`;
  $marginTop?: number;
  $marginBottom?: number;
  $round?: boolean;
}>`
  ${({ $variant, $marginTop, $marginBottom, theme }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 40px;
    padding: 0 16px;
    min-width: 96px;
    border-radius: 100px;
    border: 1px solid transparent;
    &:disabled {
      border: 1px solid ${theme.colors.textDisabled};
      background: transparent;
      color: ${theme.colors.textDisabled};
      box-shadow: 0px 12px 24px transparent;
    }
    ${$variant === EButtonVariants.PRIMARY
      ? css`
          color: ${theme.colors.textPink};
          background: ${theme.colors.pinkBackground};

          &:hover:enabled,
          &:focus:enabled {
            background: ${theme.colors.textPink};
            color: ${theme.colors.pinkBackground};
          }
        `
      : ''}
    ${$variant === EButtonVariants.SECONDARY
      ? css`
          color: #727272;
          background: #f5f5f5;

          &:hover:enabled,
          &:focus:enabled {
            background: #f2efff;
          }
          &:active:enabled {
            background: #dcd3ff;
          }
        `
      : ''}
  ${$variant === EButtonVariants.MODAL_PRIMARY
      ? css`
          color: ${theme.colors.pinkBackground};
          background: ${theme.colors.textPink};
          box-shadow: ${theme.boxShadow.large} ${theme.colors.shadow};

          &:hover:enabled,
          &:focus:enabled {
            background: ${theme.colors.pinkBackground};
            color: ${theme.colors.textPink};
          }
          &:active:enabled {
            box-shadow: ${theme.boxShadow.medium} transparent;
          }
        `
      : ''}
  ${$variant === EButtonVariants.MODAL_SECONDARY
      ? css`
          color: ${theme.colors.textPink};
          background: ${theme.colors.cardBackground};
          border: 1px solid ${theme.colors.textPink};
          box-shadow: ${theme.boxShadow.large} ${theme.colors.shadow};

          &:hover:enabled,
          &:focus:enabled {
            background: ${theme.colors.textPink};
            color: ${theme.colors.pinkBackground};
            border: 1px solid ${theme.colors.textPink};
          }
          &:active:enabled {
            background: ${theme.colors.textPink};
            color: ${theme.colors.cardBackground};
            box-shadow: ${theme.boxShadow.medium} transparent;
          }
        `
      : ''}
  ${$variant === EButtonVariants.ACCENT
      ? css`
          color: white;
          background: linear-gradient(245deg, #bd235d 10%, #000000 90%);
          box-shadow: 0px 12px 24px rgba(240, 44, 113, 0.24);
          border: none;
          &:hover:enabled {
            background: #bd235d;
          }
          &:active:enabled {
            box-shadow: 0px 12px 24px transparent;
          }
        `
      : ''}
  ${$variant === EButtonVariants.TRANSPARENT
      ? css`
          color: ${theme.colors.buttonText};
          background: rgba(255, 255, 255, 0.24);

          &:hover:enabled,
          &:focus:enabled {
            background: rgba(255, 255, 255, 0.34);
          }
        `
      : ''}
  ${$variant === EButtonVariants.SUCCESS
      ? css`
          color: ${theme.colors.textSuccess};
          background: ${theme.colors.successBackground};

          &:hover:enabled,
          &:focus:enabled {
            color: ${theme.colors.successBackground};
            background: ${theme.colors.textSuccess};
          }
        `
      : ''}
  ${$marginTop ? `margin-top: ${$marginTop}px;` : ''}
  ${$marginBottom ? `margin-bottom: ${$marginBottom}px;` : ''}

  transition-property: color, background, box-shadow, border;
    transition-duration: ${theme.transition.normal};
    transition-timing-function: ease-out;
  `}

  ${({ $round }) =>
    $round
      ? css`
          min-width: 48px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
        `
      : ''}

  @media screen and (min-width: 480px) {
    ${({ $round }) => ($round ? '' : 'min-width: 128px;')}
    gap: 10px;
    height: 48px;
  }
`;
