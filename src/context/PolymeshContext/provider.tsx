import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { EventRecord } from '@polymeshassociation/polymesh-sdk/types';
import PolymeshContext from './context';
import { useLocalStorage } from '~/hooks/utility';
import { notifyGlobalError } from '~/helpers/notifications';

interface IProviderProps {
  children: React.ReactNode;
}

const injectedExtensions = BrowserExtensionSigningManager.getExtensionList();

const PolymeshProvider = ({ children }: IProviderProps) => {
  const [sdk, setSdk] = useState<Polymesh | null>(null);
  const [polkadotApi, setPolkadotApi] = useState<
    Polymesh['_polkadotApi'] | null
  >(null);
  const [signingManager, setSigningManager] =
    useState<BrowserExtensionSigningManager | null>(null);
  const [connecting, setConnecting] = useState<boolean | null>(null);
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
  const [subscribedEventRecords, setSubscribedEventRecords] = useState<{
    events: EventRecord[];
    blockHash: string;
  }>({ events: [], blockHash: '' });
  const sdkRef = useRef<Polymesh | null>(null);
  const nodeUrlRef = useRef<string | null>(null);
  const middlewareUrlRef = useRef<string | null>(null);
  const middlewareKeyRef = useRef<string | null>(null);
  const latestCallTimestampRef = useRef<number>(0);

  // Create the browser extension signing manager and connect to the Polymesh SDK.
  const connectWallet = useCallback(
    async (extensionName: string) => {
      setConnecting(true);
      const currentTimestamp = Date.now();
      latestCallTimestampRef.current = currentTimestamp;
      try {
        nodeUrlRef.current = nodeUrl;
        middlewareUrlRef.current = middlewareUrl;
        middlewareKeyRef.current = middlewareKey;
        const signingManagerInstance =
          await BrowserExtensionSigningManager.create({
            appName: 'polymesh-portal',
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
          // return if a newer call of connectWallet is in progress.
          if (currentTimestamp !== latestCallTimestampRef.current) {
            return;
          }
          sdkRef.current = sdkInstance;
        } else {
          sdkRef.current.setSigningManager(signingManagerInstance);
        }
        // We disable filtering by genesis hash for the polywallet as older releases
        // of the wallet incorrectly configured the genesis hash for ledger keys which
        // is causing issues for users.
        // TODO: Remove when the wallet is update to allow locking keys to a specific chain
        if (extensionName !== 'polywallet') {
          signingManagerInstance.setGenesisHash(
            // eslint-disable-next-line no-underscore-dangle
            sdkRef.current._polkadotApi.genesisHash.toString(),
          );
        }
        setSigningManager(signingManagerInstance);
        setDefaultExtension(extensionName);
        setSdk(sdkRef.current);
        // eslint-disable-next-line no-underscore-dangle
        setPolkadotApi(sdkRef.current._polkadotApi);
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
    ) {
      setConnecting(false);
      return;
    }

    connectWallet(defaultExtension);
  }, [
    connectWallet,
    initialized,
    defaultExtension,
    nodeUrl,
    middlewareUrl,
    middlewareKey,
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
      },
      connectWallet,
      ss58Prefix,
      subscribedEventRecords,
    }),
    [
      connectWallet,
      connecting,
      defaultExtension,
      initialized,
      middlewareKey,
      middlewareUrl,
      nodeUrl,
      polkadotApi,
      sdk,
      setDefaultExtension,
      setMiddlewareKey,
      setMiddlewareUrl,
      setNodeUrl,
      signingManager,
      ss58Prefix,
      subscribedEventRecords,
    ],
  );

  return (
    <PolymeshContext.Provider value={contextValue}>
      {children}
    </PolymeshContext.Provider>
  );
};

export default PolymeshProvider;
