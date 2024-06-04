import { useState } from 'react';
import { Modal } from '~/components';
import { EActionButtonStatus, TAuthModalType } from '../../constants';
import { StyledAuthHeaderWrap, StyledAuthHeader } from '../../styles';
import { ActionButton } from '../ActionButton';
import { PopupWelcome } from '../PopupWelcome';
import { PopupConnectWallet } from '../PopupConnectWallet';
import { PopupVerifyIdentity } from '../PopupVerifyIdentity';
import { StyledAuthButtons, StyledModalContent } from './styles';

export const ViewUnverified = ({
  handleVerify,
}: {
  handleVerify: () => void;
}) => {
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
          title="Step 1"
          label="Connect Wallet"
          icon="ConnectWalletIcon"
          status={EActionButtonStatus.ACTION_ACTIVE}
          handleClick={() => setAuthModal('connect')}
        />
        <ActionButton
          title="Step 2"
          label="Verify Identity"
          icon="ConnectIdentityIcon"
          status={EActionButtonStatus.ACTION_ACTIVE}
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
