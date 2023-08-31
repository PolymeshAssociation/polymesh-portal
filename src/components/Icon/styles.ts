import styled from 'styled-components';

export const IconWrapper = styled.div<{ $size?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  ${({ $size }) => `
    width: ${$size || 'initial'};
    height: ${$size || 'initial'}
  `}

  & svg {
    fill: currentColor;
    width: inherit;
    height: inherit;
  }
`;
