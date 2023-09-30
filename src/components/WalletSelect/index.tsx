import { useState, useRef, useEffect, useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { Icon } from '~/components';
import {
  StyledSelectWrapper,
  StyledSelect,
  StyledExpandedSelect,
  StyledInput,
  StyledLabel,
  IconWrapper,
  StyledKeyLabel,
} from './styles';
import { formatKey } from '~/helpers/formatters';
import { ESelectPlacements, ISelectProps } from './types';
import { SkeletonLoader } from '../UiKit';

const WalletSelect: React.FC<ISelectProps> = ({ placement = 'header' }) => {
  const {
    selectedAccount,
    setSelectedAccount,
    allAccountsWithMeta,
    primaryKey,
    secondaryKeys,
    keyIdentityRelationships,
  } = useContext(AccountContext);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [selectedKeyName, setSelectedKeyName] = useState('');
  const [truncateLength, setTruncateLength] = useState<number | undefined>();

  useEffect(() => {
    if (!selectedAccount) {
      setSelectedKeyName('');
      return;
    }

    const keyName = allAccountsWithMeta.find(
      ({ address }) => address === selectedAccount,
    )?.meta.name;
    setSelectedKeyName(keyName || '');
  }, [selectedAccount, allAccountsWithMeta]);

  // Close dropdown when clicked outside of it
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

  const handleAccountChange: React.ReactEventHandler = ({ target }) => {
    setSelectedAccount((target as HTMLInputElement).value);
    setExpanded(false);
  };

  const handleDropdownToggle = () => {
    setExpanded((prev) => !prev);
  };

  useEffect(() => {
    const container = ref.current;

    const handleResize = () => {
      if (container) {
        setTruncateLength(Math.floor((container.clientWidth - 30) / 18));
      }
    };

    handleResize(); // Initial calculation

    const resizeObserver = new ResizeObserver(handleResize);

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [selectedAccount]);

  return selectedAccount ? (
    <StyledSelectWrapper ref={ref} $placement={placement}>
      <StyledSelect
        onClick={handleDropdownToggle}
        $expanded={expanded}
        $placement={placement}
      >
        {placement === 'widget'
          ? formatKey(selectedAccount, truncateLength, truncateLength)
          : selectedKeyName}
        <IconWrapper>
          <Icon name="DropdownIcon" />
        </IconWrapper>
      </StyledSelect>
      {expanded && (
        <StyledExpandedSelect $placement={placement}>
          {allAccountsWithMeta
            .sort((a, b) => {
              // place selected key first
              if (a.address === selectedAccount) return -1;
              if (b.address === selectedAccount) return 1;
              // place primary key of selected key identity next
              if (a.address === primaryKey) return -1;
              if (b.address === primaryKey) return 1;
              // place secondary keys next of selected key identity next
              if (secondaryKeys.includes(a.address)) return -1;
              if (secondaryKeys.includes(b.address)) return 1;

              return 0;
            })
            .map(({ address, meta }) => (
              <StyledLabel
                key={address}
                htmlFor={address}
                selected={selectedAccount === address}
                $placement={placement}
              >
                <span>
                  <span className="meta">{meta.name || ''}</span>
                  <span className="key">{formatKey(address, 8, 7)}</span>
                </span>
                <StyledKeyLabel
                  $primary={keyIdentityRelationships[address] === 'Primary'}
                  $selectedId={
                    address === selectedAccount ||
                    address === primaryKey ||
                    secondaryKeys.includes(address)
                  }
                >
                  {keyIdentityRelationships[address]}
                </StyledKeyLabel>
                <StyledInput
                  type="radio"
                  name="key"
                  value={address}
                  id={address}
                  onChange={handleAccountChange}
                />
              </StyledLabel>
            ))}
        </StyledExpandedSelect>
      )}
    </StyledSelectWrapper>
  ) : (
    <SkeletonLoader
      height={placement === ESelectPlacements.HEADER ? undefined : '32px'}
      width={placement === ESelectPlacements.HEADER ? '94px' : undefined}
      baseColor={
        placement === ESelectPlacements.HEADER
          ? undefined
          : 'rgba(255,255,255,0.05)'
      }
      highlightColor={
        placement === ESelectPlacements.HEADER
          ? undefined
          : 'rgba(255, 255, 255, 0.24)'
      }
    />
  );
};

export default WalletSelect;
