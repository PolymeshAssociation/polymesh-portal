import { useRef, useState, useEffect } from 'react';
import { Icon } from '~/components';
import { Button } from '~/components/UiKit';
import { formatDid } from '~/helpers/formatters';
import { IDetails } from '../../constants';
import {
  StyledWrapper,
  StyledExpandedDetails,
  StyledDetailItem,
} from './styles';

interface IDetailsProps {
  data: IDetails;
}

export const Details: React.FC<IDetailsProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const handleClickOutside: EventListenerOrEventListenerObject = (event) => {
      if (ref.current && !ref.current.contains(event.target as Node | null)) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  const { amount, perShare, taxPercentage, distributionId, portfolio } = data;

  return (
    <StyledWrapper isExpanded={expanded} ref={ref}>
      <Button variant="secondary" onClick={() => setExpanded((prev) => !prev)}>
        Expand
        <Icon name="ExpandIcon" size="18px" className="expand-icon" />
      </Button>
      {expanded && (
        <StyledExpandedDetails>
          <StyledDetailItem>
            Corporate Action ID
            <span>{distributionId}</span>
          </StyledDetailItem>
          <StyledDetailItem>
            Amount
            <span>{amount}</span>
          </StyledDetailItem>
          <StyledDetailItem>
            Per Share Rate
            <span>{perShare}</span>
          </StyledDetailItem>
          <StyledDetailItem>
            Tax
            <span>{taxPercentage}%</span>
          </StyledDetailItem>
          <StyledDetailItem>
            Portfolio
            <span>
              {formatDid(portfolio.did)} / {portfolio.id || 'Default'}
              {!!portfolio.name && <> / {portfolio.name}</>}
            </span>
          </StyledDetailItem>
        </StyledExpandedDetails>
      )}
    </StyledWrapper>
  );
};
