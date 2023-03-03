import styled from 'styled-components';
import { EButtonVariants } from './types';

export const StyledButton = styled.button`
  ${({ variant, marginTop, marginBottom }) => `
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 128px;
  padding: 12px 16px;
  border-radius: 100px;
  ${
    variant === EButtonVariants.ACCENT &&
    `
    color: white;
    background: linear-gradient(248.54deg, #FF2E72 0%, #4A125E 156.07%);
    box-shadow: 0px 12px 24px rgba(240, 44, 113, 0.24);
    `
  }
  ${marginTop ? `margin-top: ${marginTop}px;` : ''}
  ${marginBottom ? `margin-bottom: ${marginBottom}px;` : ''}
  `}
`;
