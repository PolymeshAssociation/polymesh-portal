import { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import PolymeshContext from './context';
import { IConnectOptions } from './constants';
import { useLocalStorage } from '~/hooks/utility';

interface IProviderProps {
  children: React.ReactNode;
}

const injectedExtensions = BrowserExtensionSigningManager.getExtensionList();

const PolymeshProvider = ({ children }: IProviderProps) => {
  const [sdk, setSdk] = useState<Polymesh | null>(null);
  const [signingManager, setSigningManager] =
    useState<BrowserExtensionSigningManager | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [defaultExtension, setDefaultExtension] = useLocalStorage<string>(
    'defaultExtension',
    '',
  );

  // Create the browser extension signing manager.
  const connectWallet = useCallback(
    async ({ extensionName, isDefault }: IConnectOptions) => {
      try {
        setConnecting(true);
        const signingManagerInstance =
          await BrowserExtensionSigningManager.create({
            appName: 'polymesh-user-portal',
            extensionName,
          });
        setSigningManager(signingManagerInstance);
        if (isDefault) {
          setDefaultExtension(extensionName);
        }
      } catch (error) {
        if (error instanceof Error) {
          setWalletError(error.message);
        } else {
          throw error;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Trigger signing manager initialization automatically when recent used extension data exists
  useEffect(() => {
    if (
      !defaultExtension ||
      !injectedExtensions.includes(defaultExtension) ||
      initialized
    )
      return;

    connectWallet({
      extensionName: defaultExtension,
      isDefault: true,
    });
  }, [connectWallet, initialized, defaultExtension]);

  // Connect to the Polymesh SDK once signing manager is created
  useEffect(() => {
    if (!signingManager || initialized) return;
    (async () => {
      try {
        const sdkInstance = await Polymesh.connect({
          nodeUrl: import.meta.env.VITE_NODE_URL,
          signingManager,
          middlewareV2: {
            link: import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL,
            key: import.meta.env.VITE_SUBQUERY_MIDDLEWARE_KEY || '',
          },
        });

        setSdk(sdkInstance);
        setInitialized(true);
      } catch (error) {
        if (error instanceof Error) {
          setWalletError(error.message);
        } else {
          throw error;
        }
      } finally {
        setConnecting(false);
      }
    })();
  }, [initialized, signingManager]);

  const contextValue = useMemo(
    () => ({
      state: {
        connecting,
        initialized,
        walletError,
      },
      api: { sdk, signingManager },
      settings: {
        defaultExtension,
        setDefaultExtension,
      },
      connectWallet,
    }),
    [
      connecting,
      initialized,
      walletError,
      sdk,
      signingManager,
      connectWallet,
      defaultExtension,
      setDefaultExtension,
    ],
  );

  return (
    <PolymeshContext.Provider value={contextValue}>
      {children}
    </PolymeshContext.Provider>
  );
};

export default PolymeshProvider;
