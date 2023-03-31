import { useState, useRef, useEffect, useContext } from 'react';
import { Identity } from '@polymeshassociation/polymesh-sdk/types';
import { AccountContext } from '~/context/AccountContext';
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
import { notifyError } from '~/helpers/notifications';

const DidSelect = () => {
  const { setSelectedAccount, allAccounts, identity, allIdentities } =
    useContext(AccountContext);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<Identity | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!identity) return;

    setSelected(identity);
  }, [identity]);

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

  const handleDidChange: React.ReactEventHandler = async ({ target }) => {
    const selectedIdentity = allIdentities.find(
      (item) => item?.did === (target as HTMLInputElement).value,
    );
    if (!selectedIdentity) {
      setSelected(null);
      setExpanded(false);
      return;
    }

    // Set key of selected identity if it exists in extension
    try {
      const { account } = await selectedIdentity.getPrimaryAccount();

      if (allAccounts.includes(account.address)) {
        setSelectedAccount(account.address);
        return;
      }

      const { data } = await selectedIdentity.getSecondaryAccounts();
      const connectedAccount = data.find((accInstance) =>
        allAccounts.includes(accInstance.account.toHuman()),
      );

      if (connectedAccount) {
        setSelectedAccount(connectedAccount.account.address);
      }
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setSelected(selectedIdentity);
      setExpanded(false);
    }
  };

  const handleDropdownToggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <StyledSelectWrapper ref={ref}>
      <StyledSelect onClick={handleDropdownToggle} expanded={expanded}>
        {selected ? (
          <>
            {formatDid(selected?.did, 20, 20)}
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
              key={option?.did}
              htmlFor={option?.did}
              selected={selected?.did === option?.did}
            >
              {formatDid(option?.did, 20, 20)}
              <StyledInput
                type="radio"
                name="key"
                value={option?.did}
                id={option?.did}
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
