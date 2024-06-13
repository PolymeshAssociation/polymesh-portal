import { useAuthContext } from '~/context/AuthContext';
import { WALLET_CONNECT_OPTIONS } from '~/constants/wallets';
import { Text, Heading } from '~/components/UiKit';
import { TConnectModalType } from '~/context/AuthContext/constants';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { SecondaryButton } from '../../../SecondaryButton';
import { BrowserSupport } from '../BrowserSupport';
import { isSupportedBrowser } from './helpers';
import {
  StyledExtensionInfo,
  StyledExtensionInfoItem,
  StyledExtensionItemNumber,
  StyledExtraBoldText,
} from './styles';

export const ExtensionInfo = () => {
  const { connectPopup, setConnectPopup, isMobileDevice } = useAuthContext();

  const currentExtension =
    WALLET_CONNECT_OPTIONS[connectPopup as TConnectModalType];

  const handleDownloadExtension = () =>
    window.open(currentExtension?.downloadUrl, '_blank');

  const handleProceed = () => {
    // reload all app to inject provider from extension
    window.location.reload();
  };

  const renderPostInstallInfo = () => {
    switch (connectPopup) {
      case 'Polymesh':
      case 'Talisman':
      case 'Subwallet':
        return (
          <Text size="large">
            On the following screen, you will be asked an access from{' '}
            {currentExtension?.walletName}, select{' '}
            <StyledExtraBoldText>
              {currentExtension?.walletName === 'Polymesh'
                ? '"Autorize"'
                : '"Connect"'}
            </StyledExtraBoldText>{' '}
            when prompted to do so.
          </Text>
        );
      case 'Polkadot':
        return (
          <Text size="large">
            On the following screen, you will be asked an access from Polkadot
            wallet, select{' '}
            <StyledExtraBoldText>
              “Yes, allow this application access”
            </StyledExtraBoldText>{' '}
            when prompted to do so.
          </Text>
        );

      default:
        return <div />;
    }
  };

  if (!isSupportedBrowser(connectPopup as string) && !isMobileDevice) {
    return <BrowserSupport walletName={connectPopup as string} />;
  }

  return (
    <>
      <StyledExtensionInfo>
        <Heading type="h4">
          Create new {currentExtension?.walletName} wallet
        </Heading>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>1</StyledExtensionItemNumber>
          <Text size="medium">
            Install the browser extension on Chrome from the{' '}
            <SecondaryButton
              label=" Extension Store"
              handleClick={handleDownloadExtension}
            />
          </Text>
        </StyledExtensionInfoItem>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>2</StyledExtensionItemNumber>
          <Text>Create a new wallet account</Text>
        </StyledExtensionInfoItem>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>3</StyledExtensionItemNumber>
          <Text>
            Once you’ve setup your wallet account, select “Proceed” to reload
            the page
          </Text>
        </StyledExtensionInfoItem>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>4</StyledExtensionItemNumber>
          <Text>Connect with installed extension</Text>
        </StyledExtensionInfoItem>
        {renderPostInstallInfo()}
      </StyledExtensionInfo>
      <PopupActionButtons
        onProceed={handleProceed}
        onGoBack={() => setConnectPopup('extensions')}
      />
    </>
  );
};
