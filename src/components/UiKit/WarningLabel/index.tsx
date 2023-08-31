import { useState, useEffect, useRef } from 'react';
import Icon from '~/components/Icon';
import { StyledLabel } from './styles';

interface IWarningLabelProps {
  caption: string;
  className?: string;
}

const WarningLabel: React.FC<IWarningLabelProps> = ({ caption, className }) => {
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
      $expanded={expanded}
      onClick={() => setExpanded(!expanded)}
      onMouseOver={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={className}
    >
      <Icon name="Alert" size="16px" />
      {expanded && <span>{caption}</span>}
    </StyledLabel>
  );
};

export default WarningLabel;
