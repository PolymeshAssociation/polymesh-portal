import { Text } from '~/components/UiKit';
import { Wallet } from '~/constants/wallets';
import { WalletOption } from '../WalletOption';
import { StyledInput, StyledWrapper } from './styles';

interface IWalletOption {
  walletName: string;
  extensionName: Wallet;
  iconName: string;
  isInstalled: boolean;
  recommended: boolean;
  downloadUrl: string;
}

interface IWalletOptGroupProps {
  options: IWalletOption[];
  onChange: () => void;
}

export const WalletOptionGroup: React.FC<IWalletOptGroupProps> = ({
  options,
  onChange,
}) => {
  // Sorting extension options to display installed ones first
  const recommendedOptions = options
    .filter(({ recommended }) => recommended)
    .sort((a, b) => Number(b.isInstalled) - Number(a.isInstalled));
  const otherOptions = options
    .filter(({ recommended }) => !recommended)
    .sort((a, b) => Number(b.isInstalled) - Number(a.isInstalled));

  // Open extension downloading link on extension card click if it's not installed
  const openDownloadLink = (url: string) => {
    window.open(url, '_blank').focus();
  };

  return (
    <div>
      <Text size="large" marginBottom={16} color="secondary">
        Recommended
      </Text>
      <StyledWrapper>
        {recommendedOptions.map(
          ({
            extensionName,
            walletName,
            iconName,
            isInstalled,
            downloadUrl,
          }) => (
            <div key={extensionName}>
              <StyledInput
                type="radio"
                id={walletName}
                name="wallet"
                onChange={onChange}
                disabled={!isInstalled}
                value={extensionName}
              />
              <WalletOption
                htmlFor={walletName}
                walletName={walletName}
                iconName={iconName}
                isInstalled={isInstalled}
                onClick={
                  isInstalled ? undefined : () => openDownloadLink(downloadUrl)
                }
              />
            </div>
          ),
        )}
      </StyledWrapper>
      <Text size="large" marginBottom={16} marginTop={16} color="secondary">
        Other
      </Text>
      <StyledWrapper>
        {otherOptions.map(
          ({
            extensionName,
            walletName,
            iconName,
            isInstalled,
            downloadUrl,
          }) => (
            <div key={extensionName}>
              <StyledInput
                type="radio"
                id={walletName}
                name="wallet"
                onChange={onChange}
                disabled={!isInstalled}
                value={extensionName}
              />
              <WalletOption
                htmlFor={walletName}
                walletName={walletName}
                iconName={iconName}
                isInstalled={isInstalled}
                onClick={
                  isInstalled ? undefined : () => openDownloadLink(downloadUrl)
                }
              />
            </div>
          ),
        )}
      </StyledWrapper>
    </div>
  );
};
