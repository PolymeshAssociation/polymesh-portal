import React from 'react';
import {
  DonutProgressBarCircle,
  DonutProgressBarContainer,
  ProgressValue,
} from './styles';

interface DonutProgressBarProps {
  progress: number;
  duration: number;
  size?: string;
}

const DonutProgressBar: React.FC<DonutProgressBarProps> = ({
  progress,
  duration,
  size,
}) => {
  const radius = 43;
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
          stroke="rgba(120, 120, 120, 0.2)"
          strokeWidth="13.8"
        />

        <DonutProgressBarCircle
          cx="50"
          cy="50"
          r={radius}
          stroke="#FAD1DC"
          strokeWidth="14"
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

DonutProgressBar.defaultProps = {
  size: '100px',
};

export default DonutProgressBar;
