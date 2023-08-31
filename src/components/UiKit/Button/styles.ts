import styled from 'styled-components';
import { EButtonVariants } from './types';

export const StyledButton = styled.button<{
  $variant: `${EButtonVariants}`;
  $marginTop?: number;
  $marginBottom?: number;
  $round?: boolean;
}>`
  ${({ $variant, $marginTop, $marginBottom, theme }) => `
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
  ${
    $variant === EButtonVariants.PRIMARY
      ? `
    
    color: ${theme.colors.textPink};
    background: ${theme.colors.pinkBackground};  

    &:hover:enabled, &:focus:enabled {
      background: ${theme.colors.textPink};
      color: ${theme.colors.pinkBackground};
    }

    

    `
      : ''
  }
  ${
    $variant === EButtonVariants.SECONDARY
      ? `
    color: #727272;
    background: #F5F5F5;

    &:hover:enabled, &:focus:enabled {
      background: #F2EFFF;
    }
    &:active:enabled {
      background: #DCD3FF;
    }
    `
      : ''
  }
  ${
    $variant === EButtonVariants.MODAL_PRIMARY
      ? `
    color: white;
    background: #170087;  
    box-shadow: 0px 24px 24px rgba(23, 0, 135, 0.12);

    &:hover:enabled, &:focus:enabled {
      background: #100255;
    }
    &:active:enabled {
      box-shadow: 0px 12px 24px transparent;
    }


    `
      : ''
  }
  ${
    $variant === EButtonVariants.MODAL_SECONDARY
      ? `
    color: #170087;
    background: #ffffff;
    border: 1px solid #170087;

    &:hover:enabled, &:focus:enabled {
      background: #F2EFFF;
    }
    &:active:enabled {
      background: #DCD3FF;
    }

    `
      : ''
  }
  ${
    $variant === EButtonVariants.ACCENT
      ? `
    color: white;
    background: linear-gradient(248.54deg, #FF2E72 0%, #4A125E 156.07%);
    box-shadow: 0px 12px 24px rgba(240, 44, 113, 0.24);

    &:hover:enabled {
      background-position: 166px;
    }
    &:active:enabled {
      box-shadow: 0px 12px 24px transparent;
    }

    `
      : ''
  }
  ${
    $variant === EButtonVariants.TRANSPARENT
      ? `
    color: #ffffff;
    background: rgba(255, 255, 255, 0.24);

    &:hover:enabled, &:focus:enabled {
      background: rgba(255, 255, 255, 0.34);
    }


    `
      : ''
  }
  ${
    $variant === EButtonVariants.SUCCESS
      ? `
    color: ${theme.colors.textSuccess};
    background: ${theme.colors.successBackground};

    &:hover:enabled, &:focus:enabled {
      color: ${theme.colors.successBackground};
      background: ${theme.colors.textSuccess};
    }
  

    `
      : ''
  }
  ${$marginTop ? `margin-top: ${$marginTop}px;` : ''}
  ${$marginBottom ? `margin-bottom: ${$marginBottom}px;` : ''}

  transition-property: color, background, box-shadow, border;
  transition-duration: 250ms;
  transition-timing-function: ease-out;
  `}

  ${({ $round }) =>
    $round
      ? ` 
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
