import React, { useEffect, useRef, useState } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import Identicon from '@polkadot/react-identicon';
import clsx from 'clsx';
import { Icon } from '~/components';
import {
  IconWrapper,
  Label,
  OperatorEntry,
  StyledExpandable,
  StyledExpandableOperatorList,
  StyledOperatorList,
} from './styles';
import { operatorsNames } from '~/layouts/Staking/constants';
import { formatBalance, formatKey } from '~/helpers/formatters';
import { useWindowWidth } from '~/hooks/utility';

interface ExpandableOperatorProps {
  nominations:
    | string[]
    | {
        operatorAccount: string;
        value: BigNumber;
      }[];
  label: string;
}

const ExpandableOperators: React.FC<ExpandableOperatorProps> = ({
  nominations,
  label,
}) => {
  const { isMobile } = useWindowWidth();
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

  const renderOperator = (
    operator: string | { operatorAccount: string; value: BigNumber },
  ) => {
    const operatorAccount =
      typeof operator === 'string' ? operator : operator.operatorAccount;
    const value = typeof operator === 'object' ? operator.value : null;

    return (
      <OperatorEntry key={operatorAccount}>
        <Identicon
          className={clsx('identicon')}
          value={operatorAccount}
          size={18}
        />
        {operatorsNames[operatorAccount] || formatKey(operatorAccount)}
        {value && (
          <>
            {' \u2014 '}
            {formatBalance(value.toString())} POLYX {'\u00A0'}
          </>
        )}
      </OperatorEntry>
    );
  };

  return (
    <StyledExpandableOperatorList ref={ref}>
      <StyledExpandable
        onClick={() => setShowExpanded(!showExpanded)}
        $expanded={showExpanded}
        disabled={nominations.length < 1}
      >
        <Label>
          {label} ({nominations.length})
        </Label>
        {nominations.length > 0 && (
          <IconWrapper>
            <Icon name="DropdownIcon" />
          </IconWrapper>
        )}
      </StyledExpandable>
      {showExpanded && (
        <StyledOperatorList $isMobile={isMobile}>
          {nominations.map((entry) => renderOperator(entry))}
        </StyledOperatorList>
      )}
    </StyledExpandableOperatorList>
  );
};

export default ExpandableOperators;
