import { useAuthContext } from '~/context/AuthContext';
import { TConnectModalType } from '~/context/AuthContext/constants';
import { EXTENSION_CONNECT_OPTIONS, NOVA_WALLET } from '~/constants/wallets';
import { Text, Heading, Button } from '~/components/UiKit';
import { Icon, CopyToClipboard } from '~/components';
import { SecondaryButton } from '../../../SecondaryButton';
import {
  StyledWalletName,
  StyledExtensionInfo,
  StyledExtensionInfoItem,
  StyledExtensionItemNumber,
  StyledCopyContainer,
  StyledButtonContainer,
} from './styles';

export const ExtensionInfoMobile = () => {
  const { connectPopup, setConnectPopup } = useAuthContext();

  const currentExtension =
    EXTENSION_CONNECT_OPTIONS[connectPopup as TConnectModalType];

  const handleAppStoreRedirect = () => {
    window.open(currentExtension.downloadUrl, '_blank');
  };

  const handleDeepLinkRedirect = () => {
    const deepLinkBase =
      connectPopup === NOVA_WALLET
        ? 'novawallet://nova/open/dapp?url='
        : 'https://mobile.subwallet.app/browser?url=';
    window.open(`${deepLinkBase}${window.location.origin}`, '_blank');
  };

  return (
    <div>
      <StyledWalletName>
        <Icon name={currentExtension.iconName} size="75px" />
        <div>
          <Heading type="h4">{currentExtension?.walletName}</Heading>
          <Text marginTop={8} bold>
            Follow the steps to connect {currentExtension?.walletName} with
            Polymesh
          </Text>
        </div>
      </StyledWalletName>
      <StyledExtensionInfo>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>1</StyledExtensionItemNumber>
          <Text>
            Install the {currentExtension?.walletName} app from{' '}
            <SecondaryButton
              label="here"
              handleClick={handleAppStoreRedirect}
            />
          </Text>
        </StyledExtensionInfoItem>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>2</StyledExtensionItemNumber>
          <Text>Create a new key or import an existing one within the app</Text>
        </StyledExtensionInfoItem>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>3</StyledExtensionItemNumber>
          <div>
            <Text>
              Click{' '}
              <SecondaryButton
                label="here"
                handleClick={handleDeepLinkRedirect}
              />{' '}
              or go to “dApps” screen within the wallet app and paste the below
              address into the address bar
            </Text>
            <StyledCopyContainer>
              <Text bold>{window.location.origin}</Text>
              <CopyToClipboard value={window.location.origin} />
            </StyledCopyContainer>
          </div>
        </StyledExtensionInfoItem>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>4</StyledExtensionItemNumber>
          <Text>
            Select {currentExtension?.walletName} within the Portal “Connect
            Wallet” screen and approve the connection
          </Text>
        </StyledExtensionInfoItem>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>5</StyledExtensionItemNumber>
          <Text>
            Onwards, use the {currentExtension?.walletName} app to access the
            Polymesh portal.
          </Text>
        </StyledExtensionInfoItem>
      </StyledExtensionInfo>
      <StyledButtonContainer>
        <Button
          variant="modalSecondary"
          onClick={() => setConnectPopup('extensionsMobile')}
        >
          Back
        </Button>
      </StyledButtonContainer>
    </div>
  );
};
