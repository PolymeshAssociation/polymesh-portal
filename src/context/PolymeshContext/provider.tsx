import { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import PolymeshContext from './context';
import { IConnectOptions } from './constants';
import { useInjectedWeb3 } from '~/hooks/polymesh';

interface IProviderProps {
  children: React.ReactNode;
}

const PolymeshProvider = ({ children }: IProviderProps) => {
  const [sdk, setSdk] = useState<Polymesh | null>(null);
  const [signingManager, setSigningManager] =
    useState<BrowserExtensionSigningManager | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [walletError, setWalletError] = useState('');
  const { connectExtension, defaultExtension } = useInjectedWeb3();
  const [connectOptions, setConnectOptions] = useState<IConnectOptions | null>(
    () => {
      if (defaultExtension) {
        const { extensionName, isDefault } = defaultExtension;
        return { extensionName, isDefault };
      }
      return null;
    },
  );

  // Create the browser extension signing manager.
  const connectWallet = useCallback(
    async ({ extensionName, isDefault }: IConnectOptions) => {
      try {
        setConnecting(true);
        setConnectOptions({ extensionName, isDefault });
        const signingManagerInstance =
          await BrowserExtensionSigningManager.create({
            appName: 'polymesh-user-portal',
            extensionName,
          });
        setSigningManager(signingManagerInstance);
      } catch (error) {
        if (error instanceof Error) {
          setWalletError(error.message);
        } else {
          throw error;
        }
      }
    },
    [],
  );

  // Trigger signing manager initialization automatically when recent used extension data exists
  useEffect(() => {
    if (!defaultExtension || initialized) return;

    const { extensionName, isDefault } = defaultExtension;
    connectWallet({
      extensionName,
      isDefault,
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
        connectExtension(
          (connectOptions as IConnectOptions).extensionName as string,
          (connectOptions as IConnectOptions).isDefault as boolean,
        );
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
  }, [connectExtension, connectOptions, initialized, signingManager]);

  const contextValue = useMemo(
    () => ({
      state: {
        connecting,
        initialized,
        walletError,
      },
      api: { sdk, signingManager },
      connectWallet,
    }),
    [connecting, initialized, walletError, sdk, signingManager, connectWallet],
  );

  return (
    <PolymeshContext.Provider value={contextValue}>
      {children}
    </PolymeshContext.Provider>
  );
};

export default PolymeshProvider;
