import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import PolymeshContext from './context';
import { IConnectOptions } from './constants';
import { useLocalStorage } from '~/hooks/utility';
import { notifyGlobalError } from '~/helpers/notifications';

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
  const [defaultExtension, setDefaultExtension] = useLocalStorage<string>(
    'defaultExtension',
    '',
  );
  const [nodeUrl, setNodeUrl] = useLocalStorage<string>(
    'rpcUrl',
    import.meta.env.VITE_NODE_URL,
  );
  const nodeUrlRef = useRef<string | null>(null);
  const [middlewareUrl, setMiddlewareUrl] = useLocalStorage<string>(
    'middlewareUrl',
    import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL,
  );

  // Create the browser extension signing manager and connect to the Polymesh SDK.
  const connectWallet = useCallback(
    async ({ extensionName, isDefault }: IConnectOptions) => {
      setConnecting(true);
      setSdk(null);
      setSigningManager(null);
      try {
        nodeUrlRef.current = nodeUrl;
        const signingManagerInstance =
          await BrowserExtensionSigningManager.create({
            appName: 'polymesh-user-portal',
            extensionName,
          });

        const sdkInstance = await Polymesh.connect({
          nodeUrl,
          signingManager: signingManagerInstance,
          middlewareV2: {
            link: middlewareUrl,
            key: import.meta.env.VITE_SUBQUERY_MIDDLEWARE_KEY || '',
          },
        });
        signingManagerInstance.setGenesisHash(
          // eslint-disable-next-line no-underscore-dangle
          sdkInstance._polkadotApi.genesisHash.toString(),
        );
        setSigningManager(signingManagerInstance);
        if (isDefault) {
          setDefaultExtension(extensionName);
        }
        setSdk(sdkInstance);
        setInitialized(true);
      } catch (error) {
        notifyGlobalError((error as Error).message);
      } finally {
        setConnecting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Trigger signing manager initialization automatically when recent used extension data exists
  // Or reload window when RPC url is changed
  useEffect(() => {
    if (nodeUrlRef.current && nodeUrl !== nodeUrlRef.current) {
      window.location.reload();
    }

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
  }, [connectWallet, initialized, defaultExtension, nodeUrl]);

  const contextValue = useMemo(
    () => ({
      state: {
        connecting,
        initialized,
      },
      api: { sdk, signingManager },
      settings: {
        defaultExtension,
        setDefaultExtension,
        nodeUrl,
        setNodeUrl,
        middlewareUrl,
        setMiddlewareUrl,
      },
      connectWallet,
    }),
    [
      connecting,
      initialized,
      sdk,
      signingManager,
      connectWallet,
      defaultExtension,
      setDefaultExtension,
      nodeUrl,
      setNodeUrl,
      middlewareUrl,
      setMiddlewareUrl,
    ],
  );

  return (
    <PolymeshContext.Provider value={contextValue}>
      {children}
    </PolymeshContext.Provider>
  );
};

export default PolymeshProvider;
