import styled from 'styled-components';

// eslint-disable-next-line import/prefer-default-export
export const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  ${({ size }) => `
    width: ${size || 'initial'};
    height: ${size || 'initial'}
  `}

  & svg {
    fill: currentColor;
    width: inherit;
    height: inherit;
  }
`;
