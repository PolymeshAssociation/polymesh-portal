import { useContext, useState } from 'react';
import { Icon, Modal } from '~/components';
import { Heading, Button, DropdownSelect, Text } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { formatKey } from '~/helpers/formatters';
import { useWindowWidth } from '~/hooks/utility';
import {
  StyledValue,
  StyledButtonWrapper,
  StyledLabel,
  StyledActionButton,
  StyledRememberSelected,
  StyledSelect,
} from './styles';

export const DefaultAddress = () => {
  const {
    selectedAccount,
    defaultAccount,
    setDefaultAccount,
    allAccounts,
    blockedWallets,
    rememberSelectedAccount,
    setRememberSelectedAccount,
  } = useContext(AccountContext);
  const [shouldRemember, setShouldRemember] = useState(rememberSelectedAccount);
  const [addressSelectExpanded, setAddressSelectExpanded] = useState(false);
  const [newDefaultAddress, setNewDefaultAddress] = useState<string>('');
  const { isMobile } = useWindowWidth();

  const toggleModal = () => {
    setAddressSelectExpanded((prev) => !prev);
    setNewDefaultAddress('');
  };

  const handleApply = () => {
    setDefaultAccount(newDefaultAddress);
    setRememberSelectedAccount(shouldRemember);
    toggleModal();
  };

  const handleDropdownSelect = (option: string) => {
    setNewDefaultAddress(option);
    setShouldRemember(false);
  };

  const handleToggleRememberSelected = () => {
    setShouldRemember((prev) => {
      if (prev === true) {
        setNewDefaultAddress('');
      } else {
        setNewDefaultAddress(selectedAccount);
      }
      return !prev;
    });
  };

  return (
    <>
      <StyledValue onClick={toggleModal}>
        {rememberSelectedAccount ? (
          'Remember Last Selected'
        ) : (
          <>
            {defaultAccount && (
              <>
                {formatKey(defaultAccount, 8, 8)}
                {!allAccounts.includes(defaultAccount) &&
                  !blockedWallets.includes(defaultAccount) && (
                    <StyledLabel>Not installed</StyledLabel>
                  )}
                {blockedWallets.includes(defaultAccount) && (
                  <StyledLabel>Blocked</StyledLabel>
                )}
              </>
            )}
            {!defaultAccount && 'None'}
          </>
        )}
      </StyledValue>
      {addressSelectExpanded && (
        <Modal handleClose={toggleModal} disableOverflow>
          <Heading type="h4" marginBottom={48}>
            Default Wallet Address
          </Heading>
          <StyledRememberSelected>
            <Text bold>Remember the Last Selected as Default</Text>
            <StyledSelect
              $isSelected={shouldRemember}
              onClick={handleToggleRememberSelected}
            >
              <Icon name="Check" size="16px" />
            </StyledSelect>
          </StyledRememberSelected>
          <Text bold marginTop={10} marginBottom={10}>
            or
          </Text>
          <DropdownSelect
            label="Select a Wallet Address"
            placeholder="Select Default Address"
            options={allAccounts}
            onChange={handleDropdownSelect}
            truncateOption
            truncateLength={14}
            error={undefined}
          />
          <StyledActionButton
            $marginTop={24}
            disabled={!defaultAccount}
            onClick={() => {
              setDefaultAccount('');
              localStorage.removeItem('defaultAccount');
              setRememberSelectedAccount(false);
              setShouldRemember(false);
              toggleModal();
            }}
          >
            <Icon name="CloseIcon" size="24px" />
            Remove Default
          </StyledActionButton>
          <StyledButtonWrapper>
            {!isMobile && (
              <Button variant="modalSecondary" onClick={toggleModal}>
                Cancel
              </Button>
            )}
            <Button
              variant="modalPrimary"
              disabled={
                newDefaultAddress === defaultAccount &&
                shouldRemember === rememberSelectedAccount
              }
              onClick={handleApply}
            >
              Apply
            </Button>
          </StyledButtonWrapper>
        </Modal>
      )}
    </>
  );
};
