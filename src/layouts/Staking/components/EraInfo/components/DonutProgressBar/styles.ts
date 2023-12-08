import styled from 'styled-components';

export const DonutProgressBarContainer = styled.div<{ $size: number }>`
  position: relative;
  margin-top: 12px;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  grid-row: 5 span;
  @media screen and (max-width: 860px) {
    grid-column: span 2;
    margin: 24px auto;
  }
`;

export const DonutProgressBarCircle = styled.circle`
  fill: transparent;
`;

export const ProgressValue = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: 600;
`;
