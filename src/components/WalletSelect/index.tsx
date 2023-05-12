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
import { ISelectProps } from './types';

const WalletSelect: React.FC<ISelectProps> = ({
  placement = 'header',
  trimValue = true,
}) => {
  const {
    selectedAccount,
    setSelectedAccount,
    allAccountsWithMeta,
    primaryKey,
    secondaryKeys,
  } = useContext(AccountContext);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedAccount) return;

    setSelected(selectedAccount);
  }, [selectedAccount]);

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
    setSelected((target as HTMLInputElement).value);
    setExpanded(false);
  };

  const handleDropdownToggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <StyledSelectWrapper ref={ref} placement={placement}>
      <StyledSelect
        onClick={handleDropdownToggle}
        expanded={expanded}
        placement={placement}
      >
        {selected ? (
          <>
            {trimValue ? formatKey(selected) : formatKey(selected, 7, 9)}
            <IconWrapper>
              <Icon name="DropdownIcon" />
            </IconWrapper>
          </>
        ) : (
          'loading...'
        )}
      </StyledSelect>
      {expanded && (
        <StyledExpandedSelect placement={placement}>
          {allAccountsWithMeta
            .sort(({ address }) => (address === selectedAccount ? -1 : 1))
            .sort((a, b) => {
              if (
                a.address === primaryKey &&
                !secondaryKeys.includes(b.address)
              )
                return -1;
              if (secondaryKeys.includes(a.address) && b.address !== primaryKey)
                return -1;

              return 1;
            })
            .map(({ address, meta }) => (
              <StyledLabel
                key={address}
                htmlFor={address}
                selected={selected === address}
                placement={placement}
              >
                <span>
                  {trimValue ? formatKey(address) : formatKey(address, 7, 9)}
                  <span className="meta">{meta.name || ''}</span>
                </span>
                {address === primaryKey ? (
                  <StyledKeyLabel primary>Primary</StyledKeyLabel>
                ) : null}
                {secondaryKeys.includes(address) ? (
                  <StyledKeyLabel>Second.</StyledKeyLabel>
                ) : null}
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
  );
};

export default WalletSelect;
