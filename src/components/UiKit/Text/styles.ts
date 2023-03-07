import styled from 'styled-components';

export const StyledText = styled.p`
  ${({
    theme,
    centered,
    marginTop,
    marginBottom,
    width,
    color,
    size,
    bold,
  }) => `
        ${width ? `width: ${width}px` : ''};
        ${centered ? 'text-align: center;' : ''}
        ${marginTop ? `margin-top: ${marginTop}px;` : ''}
        ${marginBottom ? `margin-bottom: ${marginBottom}px;` : ''}
        color: ${color || 'inherit'};
        font-weight: ${bold ? '500' : '400'};
        font-size: ${theme.textSize[size]};
    `}
`;
