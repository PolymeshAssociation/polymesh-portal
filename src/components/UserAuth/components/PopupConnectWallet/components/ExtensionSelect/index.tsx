import { useMemo, useContext } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { PolymeshContext } from '~/context/PolymeshContext';
import {
  WALLET_CONNECT_OPTIONS,
  PlatformOptions,
  IWalletConnectOption,
} from '~/constants/wallets';
import { Text } from '~/components/UiKit';
import { ExtensionCard } from '../ExtesionCard';
import { SecondaryButton } from '../../../SecondaryButton';
import { TConnectModalType } from '../../../../constants';
import { StyledExtensionList, StyledExtensionBox } from './styles';

interface IExtensionSelectProps {
  handleNavigate: (type: TConnectModalType) => void;
  handleClose: () => void;
}

export const ExtensionSelect = ({
  handleNavigate,
  handleClose,
}: IExtensionSelectProps) => {
  const {
    connectWallet,
    // settings: { defaultExtension },
    // state: { initialized },
  } = useContext(PolymeshContext);

  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  const walletOptions = useMemo(() => {
    const injectedExtensions =
      BrowserExtensionSigningManager.getExtensionList();
    return Object.values(WALLET_CONNECT_OPTIONS).map((option) => ({
      ...option,
      isInstalled: injectedExtensions.includes(option.extensionName),
    }));
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

  const handleExtensionClick = (
    wallet: IWalletConnectOption & { isInstalled: boolean },
  ) => {
    if (wallet.isInstalled) {
      connectWallet(wallet.extensionName);
      handleClose();
      return;
    }
    handleNavigate(wallet.walletName as TConnectModalType);
  };

  return (
    <>
      <div>
        <Text size="large" bold>
          Pick a wallet to continue:
        </Text>
        <StyledExtensionList>
          {sortedOptions.map((wallet) => (
            <StyledExtensionBox
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
          handleClick={() => handleNavigate('manual')}
        />
      </div>
    </>
  );
};
