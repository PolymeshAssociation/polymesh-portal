import { useAuthContext } from '~/context/AuthContext';
import { EXTENSION_CONNECT_OPTIONS } from '~/constants/wallets';
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
    EXTENSION_CONNECT_OPTIONS[connectPopup as TConnectModalType];

  const handleDownloadExtension = () =>
    window.open(currentExtension?.downloadUrl, '_blank');

  const handleProceed = () => {
    // reload all app to inject provider from extension
    window.location.reload();
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
            Install the browser extension from the{' '}
            <SecondaryButton
              label=" Extension Store"
              handleClick={handleDownloadExtension}
            />
          </Text>
        </StyledExtensionInfoItem>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>2</StyledExtensionItemNumber>
          <Text>
            Create a new key or import an existing one within the wallet
          </Text>
        </StyledExtensionInfoItem>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>3</StyledExtensionItemNumber>
          <Text>
            Once you’ve setup your key in the wallet, select “Proceed” to reload
            the page
          </Text>
        </StyledExtensionInfoItem>
        <StyledExtensionInfoItem>
          <StyledExtensionItemNumber>4</StyledExtensionItemNumber>
          <Text>
            Reselect your chosen wallet extension from the available options
          </Text>
        </StyledExtensionInfoItem>
        <Text size="large">
          The {currentExtension?.walletName} extension will request permission
          to connect to the Portal, select{' '}
          <StyledExtraBoldText>
            {currentExtension?.walletName === 'Polymesh'
              ? '"Authorize"'
              : '"Connect"'}
          </StyledExtraBoldText>{' '}
          when prompted to do so.
        </Text>
      </StyledExtensionInfo>
      <PopupActionButtons
        onProceed={handleProceed}
        onGoBack={() => setConnectPopup('extensions')}
      />
    </>
  );
};
