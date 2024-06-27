import React from 'react';
import {
  DonutProgressBarCircle,
  DonutProgressBarContainer,
  ProgressValue,
} from './styles';

interface DonutProgressBarProps {
  progress: number;
  duration: number;
  size?: number;
}

const defaultSize = 140;

const DonutProgressBar: React.FC<DonutProgressBarProps> = ({
  progress,
  duration,
  size = defaultSize,
}) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = progress / duration;
  const progressOffset = circumference * progressRatio;

  return (
    <DonutProgressBarContainer $size={size}>
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <DonutProgressBarCircle
          cx="50"
          cy="50"
          r={radius}
          stroke="rgba(217, 217, 217, .24)"
          strokeWidth="20"
        />

        <DonutProgressBarCircle
          cx="50"
          cy="50"
          r={radius}
          stroke="#D9D9D9"
          strokeWidth="20"
          strokeDasharray={`${progressOffset} ${
            circumference - progressOffset
          }`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <ProgressValue>{`${(100 * progressRatio).toFixed(1)}%`}</ProgressValue>
    </DonutProgressBarContainer>
  );
};

export default DonutProgressBar;
