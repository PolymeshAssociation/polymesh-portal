import { useState, useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { EActionButtonStatus, TAuthModalType } from '../../constants';
import { Modal } from '~/components';
import { ActionButton } from '../ActionButton';
import { PopupWelcome } from '../PopupWelcome';
import { PopupConnectWallet } from '../PopupConnectWallet';
import { PopupVerifyIdentity } from '../PopupVerifyIdentity';
import { StyledAuthHeaderWrap, StyledAuthHeader } from '../../styles';
import { StyledAuthButtons, StyledModalContent } from './styles';

export const ViewUnverified = ({
  handleVerify,
}: {
  handleVerify: () => void;
}) => {
  const { selectedAccount } = useContext(AccountContext);

  const [authModal, setAuthModal] = useState<TAuthModalType>(null);

  const handleCloseModal = () => setAuthModal(null);

  return (
    <>
      <PopupWelcome handleSetup={() => setAuthModal('connect')} />

      <StyledAuthHeaderWrap>
        <StyledAuthHeader>Get Started with Polymesh</StyledAuthHeader>
      </StyledAuthHeaderWrap>
      <StyledAuthButtons>
        <ActionButton
          title={selectedAccount ? 'Step 1 (Complete)' : 'Step 1'}
          label="Connect Wallet"
          icon="ConnectWalletIcon"
          status={
            selectedAccount
              ? EActionButtonStatus.ACTION_DONE
              : EActionButtonStatus.ACTION_ACTIVE
          }
          handleClick={() => setAuthModal('connect')}
        />
        <ActionButton
          title="Step 2"
          label="Verify Identity"
          icon="ConnectIdentityIcon"
          status={
            selectedAccount
              ? EActionButtonStatus.ACTION_ACTIVE
              : EActionButtonStatus.ACTION_DISABLED
          }
          handleClick={() => setAuthModal('identify')}
        />
      </StyledAuthButtons>

      {authModal && (
        <Modal handleClose={handleCloseModal} customWidth="fit-content">
          <StyledModalContent>
            {authModal === 'connect' ? (
              <PopupConnectWallet
                handleClose={handleCloseModal}
                handleProceed={() => setAuthModal('identify')}
              />
            ) : (
              <PopupVerifyIdentity
                handleClose={handleCloseModal}
                handleVerify={handleVerify}
              />
            )}
          </StyledModalContent>
        </Modal>
      )}
    </>
  );
};
