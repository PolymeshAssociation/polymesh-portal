import styled from 'styled-components';
import { EHeadingCases, EHeadingColor } from './types';

export const StyledHeading = styled.h1<{
  $centered?: boolean;
  $marginTop?: number;
  $marginBottom?: number;
  $color?: `${EHeadingColor}`;
  $transform?: `${EHeadingCases}`;
}>`
  ${({ theme, $centered, $marginTop, $marginBottom, $color, $transform }) => `
      ${$centered ? 'text-align: center;' : ''}
      ${$marginTop ? `margin-top: ${$marginTop}px;` : ''}
      ${$marginBottom ? `margin-bottom: ${$marginBottom}px;` : ''}
      ${
        $color === EHeadingColor.PRIMARY
          ? `color: ${theme.colors.textPrimary};`
          : ''
      }
      ${
        $color === EHeadingColor.SECONDARY
          ? `color: ${theme.colors.textSecondary};`
          : ''
      }
      text-transform: ${
        $transform === EHeadingCases.DEFAULT ? 'none' : $transform
      };
    `}
`;
