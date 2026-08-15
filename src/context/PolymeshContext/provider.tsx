import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import {
  EthSigningManager,
  type Eip1193Provider,
} from '@polymeshassociation/eth-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  EventRecord,
  MiddlewareMetadata,
} from '@polymeshassociation/polymesh-sdk/types';
import { WalletConnectSigningManager } from '@polymeshassociation/walletconnect-signing-manager';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isEvmWallet, WALLET_CONNECT } from '~/constants/wallets';
import {
  buildEvmChainConfig,
  ensureEvmNetwork,
  getMetaMaskProvider,
  isSameChainId,
} from '~/helpers/evm';
import { runMigration } from '~/helpers/localStorageMigrations';
import { notifyGlobalError } from '~/helpers/notifications';
import { useLocalStorage } from '~/hooks/utility';
import { IPFS_PROVIDER_URL, type TSigningManager } from './constants';
import PolymeshContext from './context';

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
  const [signingManager, setSigningManager] = useState<TSigningManager | null>(
    null,
  );
  const [connecting, setConnecting] = useState<boolean | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [signingManagerLoading, setSigningManagerLoading] = useState(false);
  const [walletConnectConnected, setWalletConnectConnected] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  const [evmNetworkMismatch, setEvmNetworkMismatch] = useState(false);
  // Held so the network can be switched after connecting without re-discovering the wallet. The
  // Signing Manager wraps the provider but does not expose it, and switching is a Portal concern:
  // the manager deliberately never prompts the wallet to change network.
  const evmProviderRef = useRef<Eip1193Provider | null>(null);

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

    setSigningManagerLoading(true);
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
    } finally {
      setSigningManagerLoading(false);
    }
  }, [polkadotApi, setDefaultExtension]);

  // No `revive` pallet check is needed: the SDK only supports chain v8, and every v8 chain carries
  // the pallet Ethereum keys dispatch through.
  const evmChainConfig = useMemo(() => {
    if (!polkadotApi) return null;

    return buildEvmChainConfig(polkadotApi, {
      rpcUrl: import.meta.env.VITE_ETH_RPC_URL,
      chainName: import.meta.env.VITE_ETH_CHAIN_NAME || 'Polymesh',
      explorerUrl: import.meta.env.VITE_SUBSCAN_URL,
    });
  }, [polkadotApi]);

  // Create the Ethereum signing manager. Currently MetaMask only: it is the wallet users reach for,
  // and it broadcasts the transaction itself rather than handing back raw signed bytes.
  const handleEvmConnect = useCallback(
    async (
      extensionName: string,
      // On an explicit user action we prompt the wallet to authorize the dApp and to switch
      // network. On an automatic reconnect we do neither: we only pick up an existing
      // authorization, so returning to the Portal never pops MetaMask open unbidden.
      { interactive = true }: { interactive?: boolean } = {},
    ) => {
      if (!polkadotApi || !evmChainConfig) return;

      setSigningManagerLoading(true);
      try {
        const provider = await getMetaMaskProvider();
        if (!provider) {
          throw new Error(
            'MetaMask was not detected. Install it, or unlock it and reload the page',
          );
        }

        // MetaMask signs and broadcasts through its own configured network, so it has to be on the
        // Polymesh chain before we let the SDK build a transaction for it.
        if (interactive) {
          await ensureEvmNetwork(provider, evmChainConfig);
        }

        const ethSigningManager = await EthSigningManager.create({
          provider,
          requestAccounts: interactive,
          ss58Format: polkadotApi.consts.system.ss58Prefix.toNumber(),
        });

        evmProviderRef.current = provider;
        setSigningManager(ethSigningManager);
        setDefaultExtension(extensionName);
      } catch (error) {
        // A silent reconnect failing just means the wallet is locked or no longer authorizes us.
        // That is the normal resting state, not something to interrupt the user about.
        if (interactive) {
          notifyGlobalError((error as Error).message);
        }
      } finally {
        setSigningManagerLoading(false);
      }
    },
    [evmChainConfig, polkadotApi, setDefaultExtension],
  );

  const switchEvmNetwork = useCallback(async () => {
    const provider = evmProviderRef.current;
    if (!provider || !evmChainConfig) return;

    try {
      await ensureEvmNetwork(provider, evmChainConfig);
      setEvmNetworkMismatch(false);
    } catch (error) {
      notifyGlobalError((error as Error).message);
    }
  }, [evmChainConfig]);

  // Create the browser extension signing manager.
  const connectWallet = useCallback(
    async (extensionName: string) => {
      if (!polkadotApi || !extensionName) return;
      if (extensionName === WALLET_CONNECT) {
        await handleWalletConnect();
        return;
      }
      if (isEvmWallet(extensionName)) {
        await handleEvmConnect(extensionName);
        return;
      }
      setSigningManagerLoading(true);
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
        setSigningManagerLoading(false);
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
      } finally {
        setSigningManagerLoading(false);
      }
    },
    [handleEvmConnect, handleWalletConnect, polkadotApi, setDefaultExtension],
  );

  // Effect to track wallet connect connection
  useEffect(() => {
    if (!signingManager || defaultExtension !== WALLET_CONNECT) {
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

  // Track the Ethereum wallet's selected network. MetaMask broadcasts the transaction itself, so if
  // the user switches network the submission silently goes to the wrong chain — this surfaces it.
  useEffect(() => {
    if (!(signingManager instanceof EthSigningManager) || !evmChainConfig) {
      setEvmNetworkMismatch(false);
      return undefined;
    }

    const expected = evmChainConfig.chainId;
    let cancelled = false;

    // The manager reports the network of the provider it wraps, so nothing here has to reach for
    // the provider itself.
    signingManager
      .getCurrentNetwork()
      .then((network) => {
        if (!cancelled && network) {
          setEvmNetworkMismatch(!isSameChainId(network.chainId, expected));
        }
      })
      // A wallet that cannot answer `eth_chainId` is not evidence of a mismatch.
      .catch(() => undefined);

    const unsub = signingManager.onNetworkChange(({ chainId }) => {
      if (!cancelled) {
        setEvmNetworkMismatch(!isSameChainId(chainId, expected));
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [evmChainConfig, signingManager]);

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
    if (signingManager || !defaultExtension) return;

    if (isEvmWallet(defaultExtension)) {
      // Wait for the chain, which is what the wallet's network is checked against.
      if (!polkadotApi) return;
      handleEvmConnect(defaultExtension, { interactive: false });
      return;
    }

    const injectedExtensions =
      BrowserExtensionSigningManager.getExtensionList();
    if (
      !injectedExtensions.includes(defaultExtension) &&
      defaultExtension !== WALLET_CONNECT
    ) {
      return;
    }
    connectWallet(defaultExtension);
  }, [
    connectWallet,
    defaultExtension,
    handleEvmConnect,
    polkadotApi,
    signingManager,
  ]);

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
        signingManagerLoading,
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
      evmNetworkMismatch,
      switchEvmNetwork,
      ss58Prefix,
      subscribedEventRecords,
      refreshMiddlewareMetadata,
    }),
    [
      connecting,
      connectWallet,
      defaultExtension,
      disconnectWalletConnect,
      evmNetworkMismatch,
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
      signingManagerLoading,
      ss58Prefix,
      subscribedEventRecords,
      switchEvmNetwork,
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
