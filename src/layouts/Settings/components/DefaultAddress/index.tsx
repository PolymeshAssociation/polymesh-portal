import { useContext, useState } from 'react';
import { Icon, Modal } from '~/components';
import { Heading, Button, DropdownSelect } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { formatKey } from '~/helpers/formatters';
import {
  StyledValue,
  StyledButtonWrapper,
  StyledLabel,
  StyledActionButton,
} from './styles';

export const DefaultAddress = () => {
  const { defaultAccount, setDefaultAccount, allAccounts, blockedWallets } =
    useContext(AccountContext);
  const [addressSelectExpanded, setAddressSelectExpanded] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  const toggleModal = () => {
    setAddressSelectExpanded((prev) => !prev);
    setSelectedAddress('');
  };

  const handleApply = () => {
    setDefaultAccount(selectedAddress);
    toggleModal();
  };

  return (
    <>
      <StyledValue onClick={toggleModal}>
        {defaultAccount ? (
          <>
            {formatKey(defaultAccount)}
            {!allAccounts.includes(defaultAccount) &&
              !blockedWallets.includes(defaultAccount) && (
                <StyledLabel>Not installed</StyledLabel>
              )}
            {blockedWallets.includes(defaultAccount) && (
              <StyledLabel>Blocked</StyledLabel>
            )}
          </>
        ) : (
          'None'
        )}
      </StyledValue>
      {addressSelectExpanded && (
        <Modal handleClose={toggleModal} disableOverflow>
          <Heading type="h4" marginBottom={48}>
            Default Wallet Address
          </Heading>
          <DropdownSelect
            label="Wallet Address"
            placeholder="Select Default Address"
            options={allAccounts}
            onChange={(option) => setSelectedAddress(option)}
            truncateOption
            truncateLength={14}
            error={undefined}
          />
          <StyledActionButton
            marginTop={24}
            disabled={!defaultAccount}
            onClick={() => {
              setDefaultAccount('');
              localStorage.removeItem('defaultAccount');
              toggleModal();
            }}
          >
            <Icon name="CloseIcon" size="24px" />
            Remove Default
          </StyledActionButton>
          <StyledButtonWrapper>
            <Button variant="modalSecondary" onClick={toggleModal}>
              Cancel
            </Button>
            <Button
              variant="modalPrimary"
              disabled={!selectedAddress || selectedAddress === defaultAccount}
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
