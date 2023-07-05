import styled from 'styled-components';
import { ETextColor, ETextTransform, ETextSize } from './types';

export const StyledText = styled.p<{
  centered?: boolean;
  marginTop?: number;
  marginBottom?: number;
  width?: number;
  color?: `${ETextColor}`;
  size?: `${ETextSize}`;
  bold?: boolean;
  transform?: `${ETextTransform}`;
  truncateOverflow?: boolean; // Renamed prop to truncate
}>`
  ${({
    theme,
    centered,
    marginTop,
    marginBottom,
    width,
    color,
    size = ETextSize.MEDIUM,
    bold,
    transform,
    truncateOverflow,
  }) => `
        ${width ? `width: ${width}px;` : ''}
        ${centered ? 'text-align: center;' : ''}
        ${marginTop ? `margin-top: ${marginTop}px;` : ''}
        ${marginBottom ? `margin-bottom: ${marginBottom}px;` : ''}
        ${
          color === ETextColor.PRIMARY
            ? `color: ${theme.colors.textPrimary};`
            : ''
        }
        ${
          color === ETextColor.SECONDARY
            ? `color: ${theme.colors.textSecondary};`
            : ''
        }
        font-weight: ${bold ? '500' : '400'};
        font-size: ${theme.textSize[size]};
        text-transform: ${transform || 'none'};
        ${
          truncateOverflow
            ? `
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            `
            : ''
        }
    `}
`;
