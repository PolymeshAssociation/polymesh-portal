import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useAuthContext } from '~/context/AuthContext';
import { TConnectModalType } from '~/context/AuthContext/constants';
import { WALLET_CONNECT_OPTIONS } from '~/constants/wallets';
import { Text, Heading, Button } from '~/components/UiKit';
import { Icon } from '~/components';
import { SecondaryButton } from '../../../SecondaryButton';
import {
  StyledWalletName,
  StyledExtensionInfo,
  StyledExtensionInfoItem,
  StyledExtensionItemNumber,
  StyledCopyContainer,
  StyledCopyBtn,
  StyledButtonContainer,
  StyledAccentText,
} from './styles';

export const ExtensionInfoMobile = () => {
  const { connectPopup, isNewWalletMobile, setConnectPopup } = useAuthContext();

  const currentExtension =
    WALLET_CONNECT_OPTIONS[connectPopup as TConnectModalType];

  const handleAppStoreRedirect = () => {
    window.open(currentExtension.downloadUrl, '_blank');
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
      {isNewWalletMobile ? (
        <StyledExtensionInfo>
          <StyledExtensionInfoItem>
            <StyledExtensionItemNumber>1</StyledExtensionItemNumber>
            <Text>
              Install the {currentExtension?.walletName} app from the{' '}
              <SecondaryButton
                label="App Store"
                handleClick={handleAppStoreRedirect}
              />
            </Text>
          </StyledExtensionInfoItem>
          <StyledExtensionInfoItem>
            <StyledExtensionItemNumber>2</StyledExtensionItemNumber>
            <Text>Create a new wallet account</Text>
          </StyledExtensionInfoItem>
          <StyledExtensionInfoItem>
            <StyledExtensionItemNumber>3</StyledExtensionItemNumber>
            <Text>Go to “dApps” screen within the Nova Wallet app</Text>
          </StyledExtensionInfoItem>
          <StyledExtensionInfoItem>
            <StyledExtensionItemNumber>4</StyledExtensionItemNumber>
            <div>
              <Text>
                Copy & paste this address in {currentExtension?.walletName} App
                search and select the result
              </Text>
              <StyledCopyContainer>
                <Text bold>portal.polymesh.network</Text>
                <CopyToClipboard text="https://portal.polymesh.network/">
                  <StyledCopyBtn>
                    <Icon name="CopyIcon" size="16px" />
                    <Text size="small" bold>
                      Copy URL
                    </Text>
                  </StyledCopyBtn>
                </CopyToClipboard>
              </StyledCopyContainer>
            </div>
          </StyledExtensionInfoItem>
          <StyledExtensionInfoItem>
            <StyledExtensionItemNumber>5</StyledExtensionItemNumber>
            <Text>
              On “Connect with {currentExtension?.walletName}” screen, select{' '}
              <StyledAccentText>“Connect”</StyledAccentText>
            </Text>
          </StyledExtensionInfoItem>
          <StyledExtensionInfoItem>
            <StyledExtensionItemNumber>6</StyledExtensionItemNumber>
            <Text>
              Onwards, use {currentExtension?.walletName} app to access the
              Polymesh portal.
            </Text>
          </StyledExtensionInfoItem>
        </StyledExtensionInfo>
      ) : (
        <StyledExtensionInfo>
          <StyledExtensionInfoItem>
            <StyledExtensionItemNumber>1</StyledExtensionItemNumber>
            <Text>
              Go to “dApps” screen within the {currentExtension?.walletName} app
            </Text>
          </StyledExtensionInfoItem>
          <StyledExtensionInfoItem>
            <StyledExtensionItemNumber>2</StyledExtensionItemNumber>
            <div>
              <Text>
                Find Polymesh logo in “Recents” section or Copy & paste this
                address in {currentExtension?.walletName} App search
              </Text>
              <StyledCopyContainer>
                <Text bold>portal.polymesh.network</Text>
                <CopyToClipboard text="https://portal.polymesh.network/">
                  <StyledCopyBtn>
                    <Icon name="CopyIcon" size="16px" />
                    <Text size="small" bold>
                      Copy URL
                    </Text>
                  </StyledCopyBtn>
                </CopyToClipboard>
              </StyledCopyContainer>
            </div>
          </StyledExtensionInfoItem>
        </StyledExtensionInfo>
      )}
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
