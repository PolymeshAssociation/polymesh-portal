import { Text, Heading } from '~/components/UiKit';
import { WALLET_CONNECT_OPTIONS } from '~/constants/wallets';
import { TConnectModalType } from '../../../../constants';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { SecondaryButton } from '../../../SecondaryButton';
import {
  StyledExtensionInfo,
  StyledExtensionInfoItem,
  StyledExtensionItemNumber,
  StyledExtraBoldText,
} from './styles';

interface IExtensionInfoProps {
  selectedExtension: Partial<TConnectModalType>;
  navigate: (type: TConnectModalType) => void;
}

export const ExtensionInfo = ({
  selectedExtension,
  navigate,
}: IExtensionInfoProps) => {
  const currentExtension = WALLET_CONNECT_OPTIONS[selectedExtension];

  const handleDownloadExtension = () =>
    window.open(currentExtension?.downloadUrl, '_blank');

  const renderPostInstallInfo = () => {
    switch (selectedExtension) {
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
          <Text>Once you’ve setup your wallet account, select “Proceed”</Text>
        </StyledExtensionInfoItem>
        {renderPostInstallInfo()}
      </StyledExtensionInfo>
      <PopupActionButtons
        onProceed={() => navigate('wallet')}
        onGoBack={() => navigate('extensions')}
      />
    </>
  );
};
