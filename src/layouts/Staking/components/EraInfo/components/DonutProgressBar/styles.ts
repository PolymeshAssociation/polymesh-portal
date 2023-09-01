import styled from 'styled-components';

export const DonutProgressBarContainer = styled.div<{ $size: number }>`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  grid-row: 4 span;
`;

export const DonutProgressBarCircle = styled.circle`
  fill: transparent;
`;

export const ProgressValue = styled.span<{ $size: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${({ $size }) => $size / 6}px;
`;
