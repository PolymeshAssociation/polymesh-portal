import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useAuthContext } from '~/context/AuthContext';
import { EKeyIdentityStatus } from '~/context/AccountContext/constants';
import { EActionButtonStatus } from '../../constants';
import { ActionButton } from '../ActionButton';
import { PopupWelcome } from '../PopupWelcome';
import { StyledAuthHeaderWrap, StyledAuthHeader } from '../../styles';
import { StyledAuthButtons } from './styles';

export const ViewUnverified = () => {
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);
  const { selectedAccount, keyCddVerificationInfo } =
    useContext(AccountContext);
  const { setConnectPopup, setIdentityPopup } = useAuthContext();

  const getIdentityButtonStatus = () => {
    if (
      polkadotApi?.genesisHash.toString() !== import.meta.env.VITE_GENESIS_HASH
    ) {
      return EActionButtonStatus.ACTION_DISABLED;
    }
    if (keyCddVerificationInfo?.status === EKeyIdentityStatus.PENDING) {
      return EActionButtonStatus.ACTION_PENDING;
    }
    if (!selectedAccount) {
      return EActionButtonStatus.ACTION_DISABLED;
    }
    return EActionButtonStatus.ACTION_ACTIVE;
  };

  return (
    <>
      <PopupWelcome />

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
          matomoData={{
            eventCategory: "onboarding",
            eventAction: "connect-wallet",
            eventName: "unverified-view"
          }}          
          handleClick={() => setConnectPopup('extensions')}
        />
        <ActionButton
          title={
            keyCddVerificationInfo?.status === EKeyIdentityStatus.PENDING
              ? 'Step 2 (In Progress)'
              : 'Step 2'
          }
          label="Verify Identity"
          icon="ConnectIdentityIcon"
          status={getIdentityButtonStatus()}
          matomoData={{
            eventCategory: "onboarding",
            eventAction: "verify-identity",
            eventName: "unverified-view"
          }}
          handleClick={() =>
            setIdentityPopup({
              type:
                keyCddVerificationInfo?.status === EKeyIdentityStatus.PENDING
                  ? 'pending'
                  : 'providers',
            })
          }
        />
      </StyledAuthButtons>
    </>
  );
};
