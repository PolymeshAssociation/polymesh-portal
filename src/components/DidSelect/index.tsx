import { useState, useRef, useEffect } from 'react';
import { Identity } from '@polymeshassociation/polymesh-sdk/types';
import { useAccounts, useAccountIdentity } from '~/hooks/polymesh';
import { Icon } from '~/components';
import {
  StyledSelectWrapper,
  StyledSelect,
  StyledExpandedSelect,
  StyledInput,
  StyledLabel,
  IconWrapper,
} from './styles';
import { formatDid } from '~/helpers/formatters';

const DidSelect: React.FC<ISelectProps> = () => {
  const { setSelectedAccount } = useAccounts();
  const { identity, allIdentities } = useAccountIdentity();
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<Identity>(null);
  const ref = useRef<JSX.Element | null>();

  useEffect(() => {
    if (!identity) return;

    setSelected(identity);
  }, [identity]);

  // Close dropdown when clicked outside of it
  useEffect(() => {
    const handleClickOutside: React.ReactEventHandler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  const handleDidChange: React.ReactEventHandler = async ({ target }) => {
    const selectedIdentity = allIdentities.find(
      ({ did }) => did === target.value,
    );
    if (!selectedIdentity) {
      setSelected(null);
      setExpanded(false);
      return;
    }
    const { account } = await selectedIdentity.getPrimaryAccount();
    setSelectedAccount(account.address);
    setSelected(selectedIdentity);
    setExpanded(false);
  };

  const handleDropdownToggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <StyledSelectWrapper ref={ref} expanded={expanded}>
      <StyledSelect onClick={handleDropdownToggle} expanded={expanded}>
        {selected ? (
          <>
            {formatDid(selected.did, 10, 13)}
            <IconWrapper>
              <Icon name="DropdownIcon" />
            </IconWrapper>
          </>
        ) : (
          'loading...'
        )}
      </StyledSelect>
      {expanded && (
        <StyledExpandedSelect>
          {allIdentities.map((option) => (
            <StyledLabel
              key={option.did}
              htmlFor={option.did}
              selected={selected.did === option.did}
            >
              {formatDid(option.did, 10, 13)}
              <StyledInput
                type="radio"
                name="key"
                value={option.did}
                id={option.did}
                onChange={handleDidChange}
              />
            </StyledLabel>
          ))}
        </StyledExpandedSelect>
      )}
    </StyledSelectWrapper>
  );
};

export default DidSelect;
