import styled from 'styled-components';

export const DonutProgressBarContainer = styled.div<{ $size?: string }>`
  position: relative;
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  flex-grow: 1;
`;

export const DonutProgressBarCircle = styled.circle`
  fill: transparent;
`;

export const ProgressValue = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
`;
