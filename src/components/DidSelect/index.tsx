import { useState, useRef, useEffect, useContext } from 'react';
import type {
  Account,
  Identity,
  MultiSig,
} from '@polymeshassociation/polymesh-sdk/types';
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
import { SkeletonLoader } from '../UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';

const DidSelect = () => {
  const { setSelectedAccount, allAccounts, identity, allIdentities } =
    useContext(AccountContext);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<Identity | null>(null);
  const [truncateLength, setTruncateLength] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!identity) {
      setSelected(null);
      return;
    }

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

      const { keyType } = await account.getTypeInfo();
      if (keyType === 'MultiSig') {
        const multisigAccount = await sdk!.accountManagement.getAccount({
          address: account.address,
        });
        const { signers } = await (multisigAccount as MultiSig).details();

        const connectedAccount = signers.find((signer) =>
          allAccounts.includes((signer as Account).address),
        );

        if (connectedAccount) {
          setSelectedAccount((connectedAccount as Account).address);
          return;
        }
      }

      const { data } = await selectedIdentity.getSecondaryAccounts();
      const connectedAccount = data.find((accInstance) =>
        allAccounts.includes(accInstance.account.toHuman()),
      );

      if (connectedAccount) {
        setSelectedAccount(connectedAccount.account.address);
        return;
      }

      for (let i = 0; i < data.length; i += 1) {
        const { account: secondaryAccount } = data[i];
        const { keyType: secondaryKeyType } =
          // eslint-disable-next-line no-await-in-loop
          await secondaryAccount.getTypeInfo();
        if (secondaryKeyType === 'MultiSig') {
          // eslint-disable-next-line no-await-in-loop
          const multisigAccount = await sdk!.accountManagement.getAccount({
            address: secondaryAccount.address,
          });
          // eslint-disable-next-line no-await-in-loop
          const { signers } = await (multisigAccount as MultiSig).details();

          const connectedSecondaryAccount = signers.find((signer) =>
            allAccounts.includes((signer as Account).address),
          );

          if (connectedSecondaryAccount) {
            setSelectedAccount((connectedSecondaryAccount as Account).address);
            return;
          }
        }
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
  }, [selected]);

  return selected ? (
    <StyledSelectWrapper ref={ref}>
      {truncateLength ? (
        <>
          <StyledSelect onClick={handleDropdownToggle} $expanded={expanded}>
            {formatDid(selected.did, truncateLength, truncateLength - 2)}
            <IconWrapper>
              <Icon name="DropdownIcon" />
            </IconWrapper>
          </StyledSelect>
          {expanded && (
            <StyledExpandedSelect>
              {allIdentities.map((option) => (
                <StyledLabel
                  $textAlign="left"
                  key={option?.did}
                  htmlFor={option?.did}
                  $selected={selected?.did === option?.did}
                >
                  {formatDid(
                    option?.did,
                    truncateLength - 2,
                    truncateLength - 2,
                  )}
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
        </>
      ) : null}
    </StyledSelectWrapper>
  ) : (
    <SkeletonLoader
      height="32px"
      baseColor="rgba(255,255,255,0.05)"
      highlightColor="rgba(255, 255, 255, 0.24)"
    />
  );
};

export default DidSelect;
