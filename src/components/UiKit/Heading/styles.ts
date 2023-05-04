import styled from 'styled-components';
import { EHeadingCases } from './types';

export const StyledHeading = styled.h1<{
  centered?: boolean;
  marginTop?: number;
  marginBottom?: number;
  transform?: `${EHeadingCases}`;
}>`
  color: ${({ theme }) => theme.colors.textPrimary};
  ${({ centered, marginTop, marginBottom, transform }) => `
      ${centered ? 'text-align: center;' : ''}
      ${marginTop ? `margin-top: ${marginTop}px;` : ''}
      ${marginBottom ? `margin-bottom: ${marginBottom}px;` : ''}
      text-transform: ${
        transform === EHeadingCases.DEFAULT ? 'none' : transform
      };
    `}
`;
