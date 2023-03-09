import styled from 'styled-components';
import { EButtonVariants } from './types';

export const StyledButton = styled.button`
  ${({ variant, marginTop, marginBottom }) => `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 128px;
  padding: 12px 16px;
  border-radius: 100px;
  ${
    variant === EButtonVariants.PRIMARY
      ? `
    color: white;
    background: #170087;  
    box-shadow: 0px 24px 24px rgba(23, 0, 135, 0.12);

    &:hover, &:focus {
      background: #100255;
    }
    &:active {
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
    variant === EButtonVariants.SECONDARY
      ? `
    color: #170087;
    background: #FFFFFF;
    border: 1px solid #170087;

    &:hover, &:focus {
      background: #F2EFFF;
    }
    &:active {
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

    &:hover {
      background-position: 166px;
    }
    &:active {
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
  ${marginTop ? `margin-top: ${marginTop}px;` : ''}
  ${marginBottom ? `margin-bottom: ${marginBottom}px;` : ''}

  transition-property: color, background, box-shadow, border;
  transition-duration: 250ms;
  transition-timing-function: ease-out;
  `}
`;
