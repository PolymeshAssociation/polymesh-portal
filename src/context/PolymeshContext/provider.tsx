import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { WalletConnectSigningManager } from '@polymeshassociation/walletconnect-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  EventRecord,
  MiddlewareMetadata,
} from '@polymeshassociation/polymesh-sdk/types';
import PolymeshContext from './context';
import { IPFS_PROVIDER_URL } from './constants';
import { useLocalStorage } from '~/hooks/utility';
import { notifyGlobalError } from '~/helpers/notifications';
import { runMigration } from '~/helpers/localStorageMigrations';

interface IProviderProps {
  children: React.ReactNode;
}

interface IChainMetadata {
  [key: string]: {
    metadata: `0x${string}`;
    specVersion: string;
    timestamp: string;
  };
}

const PolymeshProvider = ({ children }: IProviderProps) => {
  const [sdk, setSdk] = useState<Polymesh | null>(null);
  const [polkadotApi, setPolkadotApi] = useState<
    Polymesh['_polkadotApi'] | null
  >(null);
  const [signingManager, setSigningManager] = useState<
    BrowserExtensionSigningManager | WalletConnectSigningManager | null
  >(null);
  const [connecting, setConnecting] = useState<boolean | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [walletConnectConnected, setWalletConnectConnected] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);

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
  const [localMetadata, setLocalMetadata] = useLocalStorage<IChainMetadata>(
    'chainMetadata',
    {
      initial: { metadata: '0x', specVersion: '', timestamp: '' },
    },
  );
  const [ipfsProviderUrl, setIpfsProviderUrl] = useLocalStorage<string>(
    'ipfsProviderUrl',
    IPFS_PROVIDER_URL,
  );

  const [subscribedEventRecords, setSubscribedEventRecords] = useState<{
    events: EventRecord[];
    blockHash: string;
  }>({ events: [], blockHash: '' });
  const sdkRef = useRef<Polymesh | null>(null);
  const nodeUrlRef = useRef<string | null>(null);
  const middlewareUrlRef = useRef<string | null>(null);
  const middlewareKeyRef = useRef<string | null>(null);
  const [middlewareMetadata, setMiddlewareMetadata] =
    useState<MiddlewareMetadata | null>(null);
  const [middlewareLoading, setMiddlewareLoading] = useState(true);

  // Parse chain metadata from local storage
  const metadata = useMemo(() => {
    const formattedMetadata: Record<string, `0x${string}`> = {};

    Object.entries(localMetadata).forEach(([key, item]) => {
      const formattedKey = `${key}-${item.specVersion}`;
      const formattedValue = item.metadata;
      formattedMetadata[formattedKey] = formattedValue;
    });

    return formattedMetadata;
  }, [localMetadata]);

  const handleWalletConnect = useCallback(async () => {
    if (!polkadotApi) return;

    try {
      const themeMode =
        (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
      const walletConnectSigningManager =
        await WalletConnectSigningManager.create({
          config: {
            projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
            metadata: {
              name: 'Polymesh Portal',
              description: 'App for interacting with the Polymesh Blockchain',
              url: 'https://portal.polymesh.network',
              icons: [
                'https://assets-global.website-files.com/61c0a31b90958801836efe1b/62d08014db27c031ec24b6f6_polymesh-symbol.svg',
              ],
            },
            chainIds: [
              `polkadot:${polkadotApi.genesisHash.toString().slice(2, 34)}`,
            ],
            optionalChainIds: [],
            modalOptions: {
              themeMode,
              themeVariables: {
                '--wcm-accent-color': '#c1246b',
                '--wcm-background-color': '#c1246b',
              },
            },
            onSessionDelete: () => {
              notifyGlobalError('The WalletConnect session has disconnected');
              setWalletConnectConnected(false);
            },
          },
          appName: 'Polymesh Portal',
          ss58Format: polkadotApi.consts.system.ss58Prefix.toNumber(),
          genesisHash: polkadotApi.genesisHash.toString(),
        });
      setDefaultExtension('walletConnect');
      setSigningManager(walletConnectSigningManager);
    } catch (error) {
      notifyGlobalError((error as Error).message);
    }
  }, [polkadotApi, setDefaultExtension]);

  // Create the browser extension signing manager.
  const connectWallet = useCallback(
    async (extensionName: string) => {
      if (!polkadotApi || !extensionName) return;
      if (extensionName === 'walletConnect') {
        await handleWalletConnect();
        return;
      }
      try {
        const signingManagerInstance =
          await BrowserExtensionSigningManager.create({
            appName: 'polymesh-portal',
            extensionName,
            accountTypes: ['sr25519', 'ed25519', 'ecdsa'],
          });
        if (extensionName !== 'polywallet') {
          signingManagerInstance.setGenesisHash(
            polkadotApi.genesisHash.toString(),
          );
        }

        signingManagerInstance.setSs58Format(
          polkadotApi.consts.system.ss58Prefix.toNumber(),
        );
        setSigningManager(signingManagerInstance);
        setDefaultExtension(extensionName);
      } catch (error) {
        notifyGlobalError((error as Error).message);
        // this is a hacky work around for wallet errors due to chrome preloading
        // the page and not passing the correct url from a new tab. Preloading may
        // still cause authorization requests from incorrect pages requiring rejection
        // and manual reload
        if (
          (error as Error).message ===
            // error message from polywallet, polkadot.js
            'Invalid url chrome://newtab/, expected to start with http: or https: or ipfs: or ipns:' ||
          // error message from talisman extension
          (error as Error).message.includes('URL protocol unsupported')
        ) {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    },
    [handleWalletConnect, polkadotApi, setDefaultExtension],
  );

  // Effect to track wallet connect connection
  useEffect(() => {
    if (!signingManager || defaultExtension !== 'walletConnect') {
      setWalletConnectConnected(false);
      return;
    }
    const isConnected = (
      signingManager as WalletConnectSigningManager
    ).isConnected();
    setWalletConnectConnected(isConnected);
  }, [defaultExtension, signingManager]);

  const disconnectWalletConnect = useCallback(async () => {
    if (signingManager && 'disconnect' in signingManager) {
      await signingManager.disconnect();
      setSigningManager(null);
      setDefaultExtension('');
    }
  }, [setDefaultExtension, signingManager]);

  useEffect(() => {
    // Run migration logic on startup
    runMigration({ middlewareUrl, setMiddlewareUrl });
    setMigrationCompleted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Connect to the Polymesh SDK.
  useEffect(() => {
    if (!migrationCompleted) return;

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

    setConnecting(true);
    (async () => {
      try {
        nodeUrlRef.current = nodeUrl;
        middlewareUrlRef.current = middlewareUrl;
        middlewareKeyRef.current = middlewareKey;
        if (!sdkRef.current) {
          const sdkInstance = await Polymesh.connect({
            nodeUrl,
            signingManager: undefined,
            middlewareV2: {
              link: middlewareUrl,
              key: middlewareKey,
            },
            polkadot: {
              noInitWarn: true,
              metadata,
            },
          });
          setSdk(sdkInstance);
          // eslint-disable-next-line no-underscore-dangle
          setPolkadotApi(sdkInstance._polkadotApi);
          sdkRef.current = sdkInstance;
          setInitialized(true);
        }
      } catch (error) {
        notifyGlobalError((error as Error).message);
      } finally {
        setConnecting(false);
      }
    })();
  }, [metadata, middlewareKey, middlewareUrl, migrationCompleted, nodeUrl]);

  // Callback to refresh middleware metadata
  const refreshMiddlewareMetadata = useCallback(async () => {
    if (!sdk) return;
    setMiddlewareLoading(true);
    const middlewareMetadataResult = await sdk.network.getMiddlewareMetadata();
    setMiddlewareMetadata(middlewareMetadataResult);
    setMiddlewareLoading(false);
  }, [sdk]);

  // Effect to refresh middleware metadata on component mount
  useEffect(() => {
    refreshMiddlewareMetadata();
  }, [refreshMiddlewareMetadata]);

  // Create an initial signing manager instance for the default extension
  useEffect(() => {
    if (signingManager) return;
    const injectedExtensions =
      BrowserExtensionSigningManager.getExtensionList();
    if (
      !defaultExtension ||
      (!injectedExtensions.includes(defaultExtension) &&
        defaultExtension !== 'walletConnect')
    ) {
      return;
    }
    connectWallet(defaultExtension);
  }, [connectWallet, defaultExtension, signingManager]);

  // Effect to subscribe to events
  useEffect(() => {
    if (!polkadotApi) return undefined;
    let unsubEvents: () => void;
    const subscribeEvents = async () => {
      try {
        unsubEvents = await polkadotApi.query.system.events((eventRecords) => {
          setSubscribedEventRecords({
            events: [...eventRecords] as EventRecord[],
            blockHash: eventRecords.createdAtHash?.toString() || '',
          });
        });
      } catch (error) {
        notifyGlobalError((error as Error).message);
      }
    };
    subscribeEvents();
    return () => {
      if (unsubEvents) unsubEvents();
    };
  }, [polkadotApi]);

  // Update locally stored chain metadata. Only a single specVersion is stored per genesis hash.
  useEffect(() => {
    if (!polkadotApi) return;

    const {
      runtimeMetadata,
      genesisHash,
      runtimeVersion: { specVersion },
    } = polkadotApi;

    const meta = {
      [genesisHash.toString()]: {
        metadata: runtimeMetadata.toHex(),
        specVersion: specVersion.toString(),
        timestamp: new Date().toISOString(),
      },
    };
    const cachePeriod = 21; // days

    setLocalMetadata((previousLocalMeta) => {
      // Filter out entries that are older than cachePeriod
      const filteredMeta = Object.entries(previousLocalMeta).reduce(
        (filtered, [key, value]) => {
          const entryTimestamp = new Date(value.timestamp);
          const retentionLimit = new Date();
          retentionLimit.setDate(retentionLimit.getDate() - cachePeriod);
          if (entryTimestamp >= retentionLimit) {
            return { ...filtered, [key]: value };
          }
          return filtered;
        },
        {} as IChainMetadata,
      );

      return { ...filteredMeta, ...meta };
    });
  }, [polkadotApi, setLocalMetadata]);

  // // Effect to subscribe to finalized transactions
  // useEffect(() => {
  //   if (!polkadotApi) return undefined;
  //   let unsubBlocks: () => void;
  //   const subscribeBlocks = async () => {
  //     try {
  //       unsubBlocks = await polkadotApi.rpc.chain.subscribeFinalizedHeads(
  //         (header) => {
  //           const blockHash = header.hash;

  //           polkadotApi.rpc.chain.getBlock(blockHash).then((block) => {
  //             const { extrinsics } = block.block;
  //             extrinsics.forEach((extrinsic) => {
  //               console.log(extrinsic.method.section, extrinsic.method.method);
  //             });
  //           });
  //         },
  //       );
  //     } catch (error) {
  //       notifyGlobalError((error as Error).message);
  //     }
  //   };
  //   subscribeBlocks();
  //   return () => {
  //     if (unsubBlocks) unsubBlocks();
  //   };
  // }, [polkadotApi]);

  const ss58Prefix = useMemo(() => sdk?.network.getSs58Format(), [sdk]);

  const contextValue = useMemo(
    () => ({
      state: {
        connecting,
        initialized,
        middlewareMetadata,
        middlewareLoading,
      },
      api: {
        sdk,
        signingManager,
        polkadotApi,
        // eslint-disable-next-line no-underscore-dangle
        gqlClient: sdk ? sdk._middlewareApiV2 : null,
      },
      settings: {
        defaultExtension,
        setDefaultExtension,
        nodeUrl,
        setNodeUrl,
        middlewareUrl,
        setMiddlewareUrl,
        middlewareKey,
        setMiddlewareKey,
        ipfsProviderUrl,
        setIpfsProviderUrl,
      },
      connectWallet,
      walletConnectConnected,
      disconnectWalletConnect,
      ss58Prefix,
      subscribedEventRecords,
      refreshMiddlewareMetadata,
    }),
    [
      connecting,
      connectWallet,
      defaultExtension,
      disconnectWalletConnect,
      initialized,
      ipfsProviderUrl,
      middlewareKey,
      middlewareLoading,
      middlewareMetadata,
      middlewareUrl,
      nodeUrl,
      polkadotApi,
      refreshMiddlewareMetadata,
      sdk,
      setDefaultExtension,
      setIpfsProviderUrl,
      setMiddlewareKey,
      setMiddlewareUrl,
      setNodeUrl,
      signingManager,
      ss58Prefix,
      subscribedEventRecords,
      walletConnectConnected,
    ],
  );

  return (
    <PolymeshContext.Provider value={contextValue}>
      {children}
    </PolymeshContext.Provider>
  );
};

export default PolymeshProvider;
