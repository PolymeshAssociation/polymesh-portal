import styled from 'styled-components';
import { EButtonVariants } from './types';

export const StyledButton = styled.button<{
  variant: `${EButtonVariants}`;
  marginTop?: number;
  marginBottom?: number;
  round?: boolean;
}>`
  ${({ variant, marginTop, marginBottom }) => `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  padding: 0 16px;
  min-width: 96px;
  border-radius: 100px;
  ${
    variant === EButtonVariants.PRIMARY
      ? `
    color: #FF2E72;
    background: #FFEBF1;  

    &:hover:enabled, &:focus:enabled {
      background: #FF2E72;
      color: #FFEBF1;
    }
    &:active:enabled {

    }
    &:disabled {
      background: #F0F0F0;
      color: #8F8F8F;
    }

    `
      : ''
  }
  ${
    variant === EButtonVariants.SECONDARY
      ? `
    color: #727272;
    background: #F5F5F5;

    &:hover:enabled, &:focus:enabled {
      background: #F2EFFF;
    }
    &:active:enabled {
      background: #DCD3FF;
    }
    &:disabled {
      color: #8F8F8F;
    }
    `
      : ''
  }
  ${
    variant === EButtonVariants.MODAL_PRIMARY
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
    &:disabled {
      background: #F0F0F0;
      color: #8F8F8F;
      box-shadow: 0px 12px 24px transparent;
    }

    `
      : ''
  }
  ${
    variant === EButtonVariants.MODAL_SECONDARY
      ? `
    color: #170087;
    background: #FFFFFF;
    border: 1px solid #170087;

    &:hover:enabled, &:focus:enabled {
      background: #F2EFFF;
    }
    &:active:enabled {
      background: #DCD3FF;
    }
    &:disabled {
      border: 1px solid #F0F0F0;
      color: #8F8F8F;
    }
    `
      : ''
  }
  ${
    variant === EButtonVariants.ACCENT
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
    &:disabled {
      background: #F0F0F0;
      color: #8F8F8F;
      box-shadow: 0px 12px 24px transparent;
    }
    `
      : ''
  }
  ${
    variant === EButtonVariants.TRANSPARENT
      ? `
    color: #ffffff;
    background: rgba(255, 255, 255, 0.24);

    &:hover:enabled, &:focus:enabled {
      background: rgba(255, 255, 255, 0.34);
    }
    &:active:enabled {
    }
    &:disabled {
      color: #8F8F8F;
    }
    `
      : ''
  }
  ${
    variant === EButtonVariants.SUCCESS
      ? `
    color: #00AA5E;
    background: #D4F7E7;

    &:hover:enabled, &:focus:enabled {
      color: #D4F7E7;
      background: #00AA5E;
    }
  
    &:disabled {
      background: #F0F0F0;
      color: #8F8F8F;
    }
    `
      : ''
  }
  ${marginTop ? `margin-top: ${marginTop}px;` : ''}
  ${marginBottom ? `margin-bottom: ${marginBottom}px;` : ''}

  transition-property: color, background, box-shadow, border;
  transition-duration: 250ms;
  transition-timing-function: ease-out;
  `}

  ${({ round }) =>
    round
      ? ` 
  min-width: 48px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  `
      : ''}

  @media screen and (min-width: 480px) {
    ${({ round }) => (round ? '' : 'min-width: 128px;')}
    gap: 10px;
    height: 48px;
  }
`;
