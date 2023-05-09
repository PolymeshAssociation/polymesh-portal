import styled from 'styled-components';
import { EButtonVariants } from './types';

export const StyledButton = styled.button<{
  variant: `${EButtonVariants}`;
  marginTop?: number;
  marginBottom?: number;
}>`
  ${({ variant, marginTop, marginBottom, theme }) => `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 128px;
  height: 48px;
  padding: 0 16px;
  border-radius: 100px;
  ${
    variant === EButtonVariants.PRIMARY
      ? `
    color: ${theme.colors.textPink};
    background: ${theme.colors.pinkBackground};  

    &:hover:enabled, &:focus:enabled {
      background: ${theme.colors.textPink};
      color: ${theme.colors.pinkBackground};
    }
    &:active:enabled {

    }
    &:disabled {
      border: 1px solid ${theme.colors.textDisabled};
      background: ${theme.colors.disabledBackground};
      color: ${theme.colors.textDisabled};
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
      border: 1px solid ${theme.colors.textDisabled};
      background: ${theme.colors.disabledBackground};
      color: ${theme.colors.textDisabled};
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
      border: 1px solid ${theme.colors.textDisabled};
      background: ${theme.colors.disabledBackground};
      color: ${theme.colors.textDisabled};
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
      background: ${theme.colors.disabledBackground};
      border: 1px solid ${theme.colors.textDisabled};
      color: ${theme.colors.textDisabled};
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
      background: ${theme.colors.disabledBackground};
      color: ${theme.colors.textDisabled};
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
      border: 1px solid ${theme.colors.textDisabled};
      background: ${theme.colors.disabledBackground};
      color: ${theme.colors.textDisabled};
    }
    `
      : ''
  }
  ${
    variant === EButtonVariants.SUCCESS
      ? `
    color: ${theme.colors.textSuccess};
    background: ${theme.colors.successBackground};

    &:hover:enabled, &:focus:enabled {
      color: ${theme.colors.successBackground};
      background: ${theme.colors.textSuccess};
    }
  
    &:disabled {
      border: 1px solid ${theme.colors.textDisabled};
      background: ${theme.colors.disabledBackground};
      color: ${theme.colors.textDisabled};
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
`;
