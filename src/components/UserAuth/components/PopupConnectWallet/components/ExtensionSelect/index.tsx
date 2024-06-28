import { useMemo, useContext } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useAuthContext } from '~/context/AuthContext';
import { TConnectModalType } from '~/context/AuthContext/constants';
import {
  WALLET_CONNECT_OPTIONS,
  PlatformOptions,
  IWalletConnectOption,
} from '~/constants/wallets';
import { Text } from '~/components/UiKit';
import { ExtensionCard } from '../ExtesionCard';
import { SecondaryButton } from '../../../SecondaryButton';
import { StyledExtensionList, StyledExtensionBox } from './styles';

export const ExtensionSelect = () => {
  const { connectWallet } = useContext(PolymeshContext);
  const { setConnectPopup, isMobileDevice } = useAuthContext();

  const walletOptions = useMemo(() => {
    const injectedExtensions =
      BrowserExtensionSigningManager.getExtensionList();
    return Object.values(WALLET_CONNECT_OPTIONS).map(
      (option: IWalletConnectOption) => ({
        ...option,
        isInstalled: injectedExtensions.includes(option.extensionName),
      }),
    );
  }, []);

  const filteredOptions = walletOptions.filter(
    ({ platform }) =>
      (isMobileDevice &&
        (platform === PlatformOptions.Mobile ||
          platform === PlatformOptions.Both)) ||
      (!isMobileDevice &&
        (platform === PlatformOptions.Computer ||
          platform === PlatformOptions.Both)),
  );

  const sortedOptions = filteredOptions
    // .filter(({ recommended }) => recommended) TODO: clarify if needed!
    .sort((a, b) => Number(b.isInstalled) - Number(a.isInstalled));

  const handleExtensionClick = async (
    wallet: IWalletConnectOption & { isInstalled: boolean },
  ) => {
    if (wallet.isInstalled) {
      connectWallet(wallet.extensionName).then(() => setConnectPopup('wallet'));
      return;
    }
    setConnectPopup(wallet.walletName as TConnectModalType);
  };

  return (
    <>
      <div>
        <Text size="large" bold>
          Pick a wallet to continue:
        </Text>
        <StyledExtensionList $isMobile={isMobileDevice}>
          {sortedOptions.map((wallet) => (
            <StyledExtensionBox
              $isMobile={isMobileDevice}
              key={wallet.walletName}
              onClick={() => handleExtensionClick(wallet)}
            >
              <ExtensionCard wallet={wallet} />
            </StyledExtensionBox>
          ))}
        </StyledExtensionList>
      </div>
      <div>
        <Text bold>Advanced:</Text>
        <SecondaryButton
          label="Manually onboard an existing key"
          handleClick={() => setConnectPopup('manual')}
        />
      </div>
    </>
  );
};
