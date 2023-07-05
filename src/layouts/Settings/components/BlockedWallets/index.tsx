import { useContext, useEffect, useRef, useState } from 'react';
import { Icon, Modal } from '~/components';
import { Heading, Text, Button } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { formatKey } from '~/helpers/formatters';
import { useWindowWidth } from '~/hooks/utility';
import {
  InputWrapper,
  StyledActionButton,
  StyledButtonWrapper,
  StyledInput,
  StyledLabel,
  StyledValue,
  StyledWalletWrapper,
  StyledErrorMessage,
  StyledActionButtonWrapper,
} from './styles';

export const BlockedWallets = () => {
  const { blockedWallets, blockWalletAddress, unblockWalletAddress } =
    useContext(AccountContext);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const [modalExpanded, setModalExpanded] = useState(false);
  const [editBlockedWallet, setEditBlockedWallet] = useState(false);
  const [blockedAddress, setBlockedAddress] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState(true);
  const addressRef = useRef<string>('');
  const { isMobile } = useWindowWidth();

  const toggleModal = () => setModalExpanded((prev) => !prev);

  const handleBlock = () => {
    blockWalletAddress(blockedAddress);
    setBlockedAddress('');
    setEditBlockedWallet(false);
  };

  const handleClose = () => {
    toggleModal();
    setEditBlockedWallet(false);
    setBlockedAddress('');
  };

  useEffect(() => {
    if (!sdk || !addressRef.current) return;

    setIsValidAddress(
      sdk.accountManagement.isValidAddress({
        address: blockedAddress,
      }),
    );
  }, [blockedAddress, sdk]);

  return (
    <>
      <StyledValue onClick={toggleModal}>{blockedWallets.length}</StyledValue>
      {modalExpanded && (
        <Modal handleClose={handleClose}>
          <Heading type="h4" marginBottom={48}>
            Blocked Wallets
          </Heading>
          <Text size="large" bold marginBottom={28}>
            {blockedWallets.length} Blocked Wallets
          </Text>
          {blockedWallets.map((wallet) => (
            <StyledWalletWrapper key={wallet}>
              <Text size="large" bold>
                {formatKey(wallet, 10, 10)}
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
                  onChange={({ target }) => {
                    setBlockedAddress(target.value);
                    addressRef.current = 'edited';
                  }}
                />
                {!isValidAddress && (
                  <StyledErrorMessage>
                    Address must be valid SS58 format
                  </StyledErrorMessage>
                )}
              </InputWrapper>
              <StyledActionButtonWrapper>
                <StyledActionButton
                  onClick={() => {
                    setEditBlockedWallet(false);
                    setBlockedAddress('');
                    setIsValidAddress(true);
                    addressRef.current = '';
                  }}
                >
                  Cancel
                </StyledActionButton>
                <StyledActionButton
                  disabled={!blockedAddress || !isValidAddress}
                  onClick={handleBlock}
                >
                  Block
                </StyledActionButton>
              </StyledActionButtonWrapper>
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
            {!isMobile && (
              <Button variant="modalSecondary" onClick={handleClose}>
                Close
              </Button>
            )}
          </StyledButtonWrapper>
        </Modal>
      )}
    </>
  );
};
