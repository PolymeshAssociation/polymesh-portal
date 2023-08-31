import React, { useState, useEffect, useRef } from 'react';
import Icon from '~/components/Icon';
import { StyledLabel, TooltipContainer } from './styles';

interface ITooltipProps {
  caption: string;
  className?: string;
  position?:
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'left'
    | 'right'
    | 'bottom-left'
    | 'bottom'
    | 'bottom-right';
  maxWidth?: number;
}

const Tooltip: React.FC<ITooltipProps> = ({
  caption,
  className = '',
  position = 'bottom-right',
  maxWidth = 250,
}) => {
  const [expanded, setExpanded] = useState(false);
  const labelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!expanded) return undefined;

    const handleClickOutside: EventListenerOrEventListenerObject = (event) => {
      if (
        labelRef.current &&
        !labelRef.current.contains(event.target as Node | null)
      ) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);

  return (
    <StyledLabel
      ref={labelRef}
      onClick={() => setExpanded(true)}
      onMouseOver={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={className}
    >
      <Icon name="InformationIcon" size="16px" />
      <TooltipContainer
        $expanded={expanded}
        $position={position}
        $maxWidth={maxWidth}
      >
        <span>{caption}</span>
      </TooltipContainer>
    </StyledLabel>
  );
};

Tooltip.defaultProps = {
  className: '',
  position: 'bottom-right',
  maxWidth: 250,
};

export default Tooltip;
