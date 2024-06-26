import { useMemo, useContext } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useAuthContext } from '~/context/AuthContext';
import { TConnectModalType } from '~/context/AuthContext/constants';
import { useWindowWidth } from '~/hooks/utility';
import {
  WALLET_CONNECT_OPTIONS,
  PlatformOptions,
  IWalletConnectOption,
} from '~/constants/wallets';
import { Text } from '~/components/UiKit';
import { Icon } from '~/components';
import { ExtensionCard } from '../ExtesionCard';
import { SecondaryButton } from '../../../SecondaryButton';
import { ActionCard } from '../../../ActionCard';
import {
  StyledExtensionName,
  StyledExtensionNameMobile,
  StyledExtensionFeaturesList,
} from '../ExtesionCard/styles';
import { StyledExtensionList, StyledExtensionBox } from './styles';

export const ExtensionSelect = () => {
  const { connectWallet } = useContext(PolymeshContext);
  const { setConnectPopup, isMobileDevice } = useAuthContext();
  const { windowWidth } = useWindowWidth();

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

  const handleWalletConnect = async () => {
    connectWallet('walletConnect').then(() => setConnectPopup('wallet'));
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
          <StyledExtensionBox
            $isMobile={isMobileDevice}
            key={'walletConnect'}
            onClick={handleWalletConnect}
          >
            <ActionCard hovered>
              <StyledExtensionName $isMobile={isMobileDevice}>
                <Icon
                  name="WalletConnectSymbol"
                  size={windowWidth > 520 || isMobileDevice ? '48px' : '28px'}
                />
                {isMobileDevice ? (
                  <StyledExtensionNameMobile>
                    <Text size="large" bold>
                      WalletConnect
                    </Text>
                    <Text>Wallet Connect</Text>
                  </StyledExtensionNameMobile>
                ) : (
                  <Text size="large">Wallet Connect</Text>
                )}
              </StyledExtensionName>
              {!isMobileDevice && (
                <StyledExtensionFeaturesList>
                  {['lorem ipsum', 'lorem ipsum', 'lorem ipsum'].map((item) => (
                    <li key={item}>
                      <Text size="small">{item}</Text>
                    </li>
                  ))}
                </StyledExtensionFeaturesList>
              )}
            </ActionCard>
          </StyledExtensionBox>
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
