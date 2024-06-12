import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { EExternalIdentityStatus } from '~/context/AccountContext/constants';
import { EActionButtonStatus } from '../../constants';
import { ActionButton } from '../ActionButton';
import { PopupWelcome } from '../PopupWelcome';
import { StyledAuthHeaderWrap, StyledAuthHeader } from '../../styles';
import { StyledAuthButtons } from './styles';

export const ViewUnverified = () => {
  const { selectedAccount, externalIdentity } = useContext(AccountContext);
  const { setConnectPopup, setIdentityPopup } = useAuthContext();

  const getIdentityButtonStatus = () => {
    if (externalIdentity?.status === EExternalIdentityStatus.PENDING) {
      return EActionButtonStatus.ACTION_PENDING;
    }
    if (!selectedAccount) {
      return EActionButtonStatus.ACTION_DISABLED;
    }
    return EActionButtonStatus.ACTION_ACTIVE;
  };

  return (
    <>
      <PopupWelcome handleSetup={() => setConnectPopup('extensions')} />

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
          handleClick={() => setConnectPopup('extensions')}
        />
        <ActionButton
          title={
            externalIdentity?.status === EExternalIdentityStatus.PENDING
              ? 'Step 2 (In Progress)'
              : 'Step 2'
          }
          label="Verify Identity"
          icon="ConnectIdentityIcon"
          status={getIdentityButtonStatus()}
          handleClick={() =>
            setIdentityPopup(
              externalIdentity?.status === EExternalIdentityStatus.PENDING
                ? 'pending'
                : 'providers',
            )
          }
        />
      </StyledAuthButtons>
    </>
  );
};
