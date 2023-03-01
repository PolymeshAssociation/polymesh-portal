import {
  useState,
  useEffect,
  createContext,
  useMemo,
  useCallback,
} from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

interface IPolymeshContext {
  state: {
    connecting: boolean;
    walletError: string;
  };
  api: {
    sdk: Polymesh;
    signingManager: BrowserExtensionSigningManager;
  };
  accounts: string[];
  connectWallet: () => Promise<void>;
}

export const PolymeshContext = createContext<IPolymeshContext>();

export const PolymeshProvider = ({ children }) => {
  const [sdk, setSdk] = useState<Polymesh>(null);
  const [signingManager, setSigningManager] =
    useState<BrowserExtensionSigningManager>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [walletError, setWalletError] = useState('');

  // Create the browser extension signing manager.
  const connectWallet = useCallback(async () => {
    try {
      setConnecting(true);
      const signingManagerInstance =
        await BrowserExtensionSigningManager.create({
          appName: 'polymesh-user-portal',
        });
      setSigningManager(signingManagerInstance);
    } catch (initError) {
      if (error instanceof Error) {
        setWalletError(error.message);
      } else {
        throw error;
      }
    }
  }, []);

  // Connect to the Polymesh SDK once signing manager is created
  useEffect(() => {
    if (!signingManager) return;

    (async () => {
      try {
        const sdkInstance = await Polymesh.connect({
          nodeUrl: import.meta.env.VITE_NODE_URL,
          signingManager,
        });

        setSdk(sdkInstance);
        setInitialized(true);
      } catch (initError) {
        if (error instanceof Error) {
          setWalletError(error.message);
        } else {
          throw error;
        }
      } finally {
        setConnecting(false);
      }
    })();
  }, [signingManager]);

  // Get list of connected accounts when sdk is initialized with signing manager
  useEffect(() => {
    if (!initialized) return;

    (async () => {
      const connectedAccounts = await signingManager.getAccounts();
      setAccounts(connectedAccounts);
    })();
  }, [initialized, signingManager]);

  // Perform actions when account change occurs in extension
  useEffect(() => {
    if (!initialized) return undefined;

    const unsubCb = signingManager.onAccountChange((newAccounts) => {
      setAccounts(newAccounts);
    });

    return () => unsubCb();
  }, [initialized, signingManager]);

  const contextValue = useMemo(
    () => ({
      state: { connecting, walletError },
      api: { sdk, signingManager },
      accounts,
      connectWallet,
    }),
    [sdk, signingManager, accounts, connecting, walletError, connectWallet],
  );

  return (
    <PolymeshContext.Provider value={contextValue}>
      {children}
    </PolymeshContext.Provider>
  );
};
