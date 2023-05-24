import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import PolymeshContext from './context';
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
  const [middlewareUrl, setMiddlewareUrl] = useLocalStorage<string>(
    'middlewareUrl',
    import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL,
  );
  const [middlewareKey, setMiddlewareKey] = useLocalStorage<string>(
    'middlewareKey',
    import.meta.env.VITE_SUBQUERY_MIDDLEWARE_KEY || '',
  );
  const sdkRef = useRef<Polymesh | null>(null);
  const nodeUrlRef = useRef<string | null>(null);
  const middlewareUrlRef = useRef<string | null>(null);
  const middlewareKeyRef = useRef<string | null>(null);

  // Create the browser extension signing manager and connect to the Polymesh SDK.
  const connectWallet = useCallback(
    async (extensionName: string) => {
      setConnecting(true);
      try {
        nodeUrlRef.current = nodeUrl;
        middlewareUrlRef.current = middlewareUrl;
        middlewareKeyRef.current = middlewareKey;
        const signingManagerInstance =
          await BrowserExtensionSigningManager.create({
            appName: 'polymesh-user-portal',
            extensionName,
          });
        if (!sdkRef.current) {
          const sdkInstance = await Polymesh.connect({
            nodeUrl,
            signingManager: signingManagerInstance,
            middlewareV2: {
              link: middlewareUrl,
              key: middlewareKey,
            },
          });
          sdkRef.current = sdkInstance;
        } else {
          sdkRef.current.setSigningManager(signingManagerInstance);
        }
        signingManagerInstance.setGenesisHash(
          // eslint-disable-next-line no-underscore-dangle
          sdkRef.current._polkadotApi.genesisHash.toString(),
        );
        setSigningManager(signingManagerInstance);
        setDefaultExtension(extensionName);
        setSdk(sdkRef.current);
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
  // Or reload window when RPC or Middleware url is changed
  useEffect(() => {
    if (nodeUrlRef.current && nodeUrl !== nodeUrlRef.current) {
      window.location.reload();
    }
    if (
      middlewareUrlRef.current &&
      middlewareUrl !== middlewareUrlRef.current
    ) {
      window.location.reload();
    }
    if (
      middlewareKeyRef.current != null &&
      middlewareKey !== middlewareKeyRef.current
    ) {
      window.location.reload();
    }

    if (
      !defaultExtension ||
      !injectedExtensions.includes(defaultExtension) ||
      initialized
    )
      return;

    connectWallet(defaultExtension);
  }, [
    connectWallet,
    initialized,
    defaultExtension,
    nodeUrl,
    middlewareUrl,
    middlewareKey,
  ]);

  const gqlClient = useMemo(() => {
    const client = new ApolloClient({
      uri: middlewareUrl,
      cache: new InMemoryCache(),
    });
    return client;
  }, [middlewareUrl]);

  const contextValue = useMemo(
    () => ({
      state: {
        connecting,
        initialized,
      },
      api: { sdk, signingManager, gqlClient },
      settings: {
        defaultExtension,
        setDefaultExtension,
        nodeUrl,
        setNodeUrl,
        middlewareUrl,
        setMiddlewareUrl,
        middlewareKey,
        setMiddlewareKey,
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
      middlewareKey,
      setMiddlewareKey,
      gqlClient,
    ],
  );

  return (
    <PolymeshContext.Provider value={contextValue}>
      {children}
    </PolymeshContext.Provider>
  );
};

export default PolymeshProvider;
