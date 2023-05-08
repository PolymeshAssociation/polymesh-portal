import { useContext, useState } from 'react';
import { Icon, Modal } from '~/components';
import { Heading, Text, Button } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { formatKey } from '~/helpers/formatters';
import {
  InputWrapper,
  StyledActionButton,
  StyledButtonWrapper,
  StyledInput,
  StyledLabel,
  StyledValue,
  StyledWalletWrapper,
} from './styles';

export const BlockedWallets = () => {
  const { blockedWallets, blockWalletAddress, unblockWalletAddress } =
    useContext(AccountContext);
  const [modalExpanded, setModalExpanded] = useState(false);
  const [editBlockedWallet, setEditBlockedWallet] = useState(false);
  const [blockedAddress, setBlockedAddress] = useState<string>('');

  const toggleModal = () => setModalExpanded((prev) => !prev);

  const handleBlock = () => {
    blockWalletAddress(blockedAddress);
    setBlockedAddress('');
    setEditBlockedWallet(false);
  };

  return (
    <>
      <StyledValue onClick={toggleModal}>{blockedWallets.length}</StyledValue>
      {modalExpanded && (
        <Modal handleClose={toggleModal}>
          <Heading type="h4" marginBottom={48}>
            Blocked Wallets
          </Heading>
          <Text size="large" bold marginBottom={28}>
            {blockedWallets.length} Blocked Wallets
          </Text>
          {blockedWallets.map((wallet) => (
            <StyledWalletWrapper key={wallet}>
              <Text size="large" bold>
                {formatKey(wallet)}
              </Text>
              <StyledActionButton onClick={() => unblockWalletAddress(wallet)}>
                Unblock
              </StyledActionButton>
            </StyledWalletWrapper>
          ))}
          {editBlockedWallet && (
            <StyledWalletWrapper>
              <InputWrapper>
                <StyledLabel htmlFor="blockWallet">
                  Block Wallet Address
                </StyledLabel>
                <StyledInput
                  placeholder="Enter Wallet Address"
                  id="blockWallet"
                  value={blockedAddress}
                  onChange={({ target }) => setBlockedAddress(target.value)}
                />
              </InputWrapper>
              <StyledActionButton onClick={() => setEditBlockedWallet(false)}>
                Cancel
              </StyledActionButton>
              <StyledActionButton
                disabled={!blockedAddress}
                onClick={handleBlock}
              >
                Block
              </StyledActionButton>
            </StyledWalletWrapper>
          )}
          <StyledActionButton
            marginTop={24}
            onClick={() => setEditBlockedWallet(true)}
          >
            <Icon name="MinusCircle" />
            Block Wallet
          </StyledActionButton>
          <StyledButtonWrapper>
            <Button variant="modalSecondary" onClick={toggleModal}>
              Close
            </Button>
          </StyledButtonWrapper>
        </Modal>
      )}
    </>
  );
};
