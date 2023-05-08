import { useContext, useState } from 'react';
import { Modal } from '~/components';
import { Heading, Text, Button } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { formatKey } from '~/helpers/formatters';
import { StyledValue, StyledButtonWrapper, StyledLabel } from './styles';

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
        <Modal handleClose={toggleModal}>
          <Heading type="h4" marginBottom={48}>
            Default Wallet Address
          </Heading>
          <Text bold marginBottom={3}>
            Wallet Address
          </Text>
          <select
            name="pets"
            id="pet-select"
            value={selectedAddress || defaultAccount}
            onChange={({ target }) => setSelectedAddress(target.value)}
          >
            <option value="">--Please choose an option--</option>
            {allAccounts.map((account) => (
              <option value={account} key={account}>
                {formatKey(account)}
              </option>
            ))}
          </select>
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
