import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { WalletSelect as WalletSelectComponent } from '~/components';
import { Text } from '~/components/UiKit';
import { useAuthContext } from '~/context/AuthContext';
import { PopupActionButtons } from '../../../PopupActionButtons';
import {
  StyledExtensionInfoItem,
  StyledExtensionItemNumber,
} from '../ExtensionInfo/styles';
import { StyledWalletSelectContainer } from './styles';

export const WalletSelect = () => {
  const { allAccountsWithMeta } = useContext(AccountContext);

  const { setConnectPopup } = useAuthContext();

  if (!allAccountsWithMeta.length) {
    return (
      <>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>1</StyledExtensionItemNumber>
          <Text>
            Create a new key or import an existing one within the wallet
          </Text>
        </StyledExtensionInfoItem>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>2</StyledExtensionItemNumber>
          <Text>
            Once you’ve setup your key in the wallet, select “Proceed” to reload
            the page
          </Text>
        </StyledExtensionInfoItem>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>3</StyledExtensionItemNumber>
          <Text>
            Reselect your chosen wallet extension from the available options
          </Text>
        </StyledExtensionInfoItem>
        <PopupActionButtons
          onProceed={() => window.location.reload()}
          onGoBack={() => setConnectPopup('extensions')}
          aligned
          data-event-category="onboarding"
          data-event-name="wallet-refresh-view"
        />
      </>
    );
  }

  return (
    <>
      <StyledWalletSelectContainer>
        <Text marginBottom={8} bold>
          Wallet Address
        </Text>
        <WalletSelectComponent placement="widget" showExternal={false} />
      </StyledWalletSelectContainer>
      <PopupActionButtons
        onProceed={() => setConnectPopup(null)}
        onGoBack={() => setConnectPopup('extensions')}
        matomoData={{
          eventCategory: 'onboarding',
          eventName: 'connect-wallet-view',
        }}
        proceedTag="wallet-proceed"
        aligned
      />
    </>
  );
};
