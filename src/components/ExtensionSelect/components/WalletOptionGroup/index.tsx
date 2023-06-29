import { Text } from '~/components/UiKit';
import { PlatformOptions, Wallet } from '~/constants/wallets';
import { WalletOption } from '../WalletOption';
import { StyledInput, StyledWrapper } from './styles';
import { TIcons } from '~/assets/icons/types';

interface IWalletOption {
  walletName: string;
  extensionName: Wallet;
  iconName: TIcons;
  isInstalled: boolean;
  recommended: boolean;
  downloadUrl: string;
  platform: PlatformOptions;
}

interface IWalletOptGroupProps {
  options: IWalletOption[];
  onChange: React.ChangeEventHandler;
  selectedWallet: string;
  isMobileDevice: boolean;
}

export const WalletOptionGroup: React.FC<IWalletOptGroupProps> = ({
  options,
  onChange,
  selectedWallet,
  isMobileDevice,
}) => {
  const filteredOptions = options.filter(
    ({ platform }) =>
      (isMobileDevice &&
        (platform === PlatformOptions.Mobile ||
          platform === PlatformOptions.Both)) ||
      (!isMobileDevice &&
        (platform === PlatformOptions.Computer ||
          platform === PlatformOptions.Both)),
  );
  // Sorting extension options to display installed ones first
  const recommendedOptions = filteredOptions
    .filter(({ recommended }) => recommended)
    .sort((a, b) => Number(b.isInstalled) - Number(a.isInstalled));

  const otherOptions = filteredOptions
    .filter(({ recommended }) => !recommended)
    .sort((a, b) => Number(b.isInstalled) - Number(a.isInstalled));

  // Open extension downloading link on extension card click if it's not installed
  const openDownloadLink = (url: string) => {
    const newTab = window.open(url, '_blank') as Window;
    newTab.focus();
  };

  return (
    <div>
      {!!recommendedOptions.length && (
        <>
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
                <div key={walletName}>
                  <StyledInput
                    type="radio"
                    id={walletName}
                    name="wallet"
                    onChange={onChange}
                    disabled={!isInstalled}
                    value={extensionName}
                    checked={selectedWallet === extensionName}
                  />
                  <WalletOption
                    htmlFor={walletName}
                    walletName={walletName}
                    iconName={iconName}
                    isInstalled={isInstalled}
                    onClick={
                      isInstalled
                        ? undefined
                        : () => openDownloadLink(downloadUrl)
                    }
                  />
                </div>
              ),
            )}
          </StyledWrapper>
          <Text size="large" marginBottom={16} marginTop={16} color="secondary">
            Other
          </Text>
        </>
      )}
      <StyledWrapper>
        {otherOptions.map(
          ({
            extensionName,
            walletName,
            iconName,
            isInstalled,
            downloadUrl,
          }) => (
            <div key={walletName}>
              <StyledInput
                type="radio"
                id={walletName}
                name="wallet"
                onChange={onChange}
                disabled={!isInstalled}
                value={extensionName}
                checked={selectedWallet === extensionName}
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
