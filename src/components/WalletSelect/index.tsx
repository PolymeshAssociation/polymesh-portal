import { useState, useRef, useEffect, useContext, useMemo } from 'react';
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
  StyledFilterInput,
  StyledFilter,
} from './styles';
import { formatKey } from '~/helpers/formatters';
import { ESelectPlacements, ISelectProps } from './types';
import { SkeletonLoader } from '../UiKit';

const WalletSelect: React.FC<ISelectProps> = ({
  placement = 'header',
  showExternal = true,
}) => {
  const {
    selectedAccount,
    setSelectedAccount,
    allAccountsWithMeta,
    primaryKey,
    secondaryKeys,
    keyIdentityRelationships,
    lastExternalKey,
    isExternalConnection,
    allAccounts,
  } = useContext(AccountContext);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [selectedKeyName, setSelectedKeyName] = useState('');
  const [truncateLength, setTruncateLength] = useState<number | undefined>();
  const [filter, setFilter] = useState('');

  // Memoize sorted accounts to avoid expensive sorting on every render
  const sortedAccounts = useMemo(() => {
    return allAccountsWithMeta.sort((a, b) => {
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
    });
  }, [allAccountsWithMeta, selectedAccount, primaryKey, secondaryKeys]);

  // Memoize filtered accounts based on search filter
  const filteredAccounts = useMemo(() => {
    if (!filter) return sortedAccounts;

    const filterLower = filter.toLowerCase();
    return sortedAccounts.filter(
      (account) =>
        account.address.toLowerCase().includes(filterLower) ||
        account.meta.name?.toLowerCase().includes(filterLower),
    );
  }, [sortedAccounts, filter]);

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
        setFilter('');
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
    setFilter('');
  };

  const handleDropdownToggle = () => {
    setExpanded((prev) => !prev);
    setFilter('');
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

  const renderSelectedField = () => {
    if (!showExternal && isExternalConnection) {
      return 'Select Wallet Address';
    }
    return placement === 'widget' || !selectedKeyName
      ? formatKey(selectedAccount, truncateLength, truncateLength)
      : selectedKeyName;
  };

  return selectedAccount ? (
    <StyledSelectWrapper ref={ref} $placement={placement}>
      <StyledSelect
        onClick={handleDropdownToggle}
        $expanded={expanded}
        $placement={placement}
      >
        {renderSelectedField()}
        <IconWrapper>
          <Icon name="DropdownIcon" />
        </IconWrapper>
      </StyledSelect>
      {expanded && (
        <StyledExpandedSelect $placement={placement}>
          <StyledFilter>
            <Icon name="Search" />
            <StyledFilterInput
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search.."
            />
          </StyledFilter>
          {filteredAccounts.map(({ address, meta }) => (
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
          {showExternal &&
            lastExternalKey &&
            lastExternalKey.toLowerCase().includes(filter.toLowerCase()) &&
            !allAccounts.includes(lastExternalKey) && (
              <StyledLabel
                key={lastExternalKey}
                htmlFor={lastExternalKey}
                selected={selectedAccount === lastExternalKey}
                $placement={placement}
              >
                <span>
                  <span className="meta">Recent External Key</span>
                  <span className="key">
                    {formatKey(lastExternalKey, 8, 7)}
                  </span>
                </span>
                <StyledInput
                  type="radio"
                  name="key"
                  value={lastExternalKey}
                  id={lastExternalKey}
                  onChange={handleAccountChange}
                />
              </StyledLabel>
            )}
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
