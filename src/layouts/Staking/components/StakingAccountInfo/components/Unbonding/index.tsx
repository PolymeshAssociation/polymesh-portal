import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { formatBalance, formatMillisecondsToTime } from '~/helpers/formatters';
import { StakingContext } from '~/context/StakingContext';
import { Icon } from '~/components';
import {
  ExpandedItem,
  IconWrapper,
  Label,
  StyledExpandable,
  StyledUnbonding,
} from './styles';

interface UnbondingDropdownProps {
  amountUnbonding: BigNumber;
  unbondingLots: UnbondingLot[];
}

interface UnbondingLot {
  id: string;
  era: BigNumber;
  amount: BigNumber;
}

const Unbonding: React.FC<UnbondingDropdownProps> = ({
  amountUnbonding,
  unbondingLots,
}) => {
  const {
    eraStatus: { getTimeUntilEraStart },
  } = useContext(StakingContext);
  const [showExpanded, setShowExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside of it
  useEffect(() => {
    const handleClickOutside: EventListenerOrEventListenerObject = (event) => {
      if (ref.current && !ref.current.contains(event.target as Node | null)) {
        setShowExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  return (
    <StyledUnbonding ref={ref}>
      <div className="unbonding">
        <Label>Unbonding ({unbondingLots.length})</Label>
        <StyledExpandable
          onClick={() => setShowExpanded(!showExpanded)}
          expanded={showExpanded}
        >
          {formatBalance(amountUnbonding?.toString())} POLYX
          <IconWrapper>
            <Icon name="DropdownIcon" />
          </IconWrapper>
        </StyledExpandable>
      </div>

      {showExpanded && (
        <div className="unbonding-lots">
          {unbondingLots.map((lot) => (
            <ExpandedItem key={lot.id}>
              {formatBalance(lot.amount.toString())} POLYX in{' '}
              {formatMillisecondsToTime(
                getTimeUntilEraStart(lot.era, true)?.toNumber(),
              )}{' '}
              (Era {lot.era.toString()})
            </ExpandedItem>
          ))}
        </div>
      )}
    </StyledUnbonding>
  );
};

export default Unbonding;
