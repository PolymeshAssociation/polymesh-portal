import {
  useState,
  useEffect,
  createContext,
  useMemo,
  useCallback,
} from 'react';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { useInjectedWeb3 } from '~/hooks/polymesh';

interface IPolymeshContext {
  state: {
    connecting: boolean;
    initialized: boolean;
    walletError: string;
    selectedAccount: string;
    setSelectedAccount: () => void;
  };
  api: {
    sdk: Polymesh;
    signingManager: BrowserExtensionSigningManager;
  };
  connectWallet: () => Promise<void>;
}

export const PolymeshContext = createContext<IPolymeshContext>();

export const PolymeshProvider = ({ children }) => {
  const [sdk, setSdk] = useState<Polymesh>(null);
  const [signingManager, setSigningManager] =
    useState<BrowserExtensionSigningManager>(null);
  const [connecting, setConnecting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [walletError, setWalletError] = useState('');
  const { connectExtension, recentExtension } = useInjectedWeb3();
  /*
    selectedAccount and setSelectedAccount are being used by useAccounts hook,
    which exposes them to rest of the app. They are here for global sync between helper hooks
  */
  const [selectedAccount, setSelectedAccount] = useState('');

  // Create the browser extension signing manager.
  const connectWallet = useCallback(async () => {
    try {
      setConnecting(true);
      const signingManagerInstance =
        await BrowserExtensionSigningManager.create({
          appName: 'polymesh-user-portal',
        });
      setSigningManager(signingManagerInstance);
    } catch (error) {
      if (error instanceof Error) {
        setWalletError(error.message);
      } else {
        throw error;
      }
    }
  }, []);

  // Trigger signing manager initialization automatically when recent used extension data exists
  useEffect(() => {
    if (!recentExtension || initialized) return;

    connectWallet();
  }, [connectWallet, initialized, recentExtension]);

  // Connect to the Polymesh SDK once signing manager is created
  useEffect(() => {
    if (!signingManager || initialized) return;
    (async () => {
      try {
        const sdkInstance = await Polymesh.connect({
          nodeUrl: import.meta.env.VITE_NODE_URL,
          signingManager,
        });

        setSdk(sdkInstance);
        setInitialized(true);
        connectExtension(signingManager.extension.name as string);
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
  }, [connectExtension, initialized, signingManager]);

  const contextValue = useMemo(
    () => ({
      state: {
        connecting,
        initialized,
        walletError,
        selectedAccount,
        setSelectedAccount,
      },
      api: { sdk, signingManager },
      connectWallet,
    }),
    [
      connecting,
      initialized,
      walletError,
      sdk,
      signingManager,
      selectedAccount,
      setSelectedAccount,
      connectWallet,
    ],
  );

  return (
    <PolymeshContext.Provider value={contextValue}>
      {children}
    </PolymeshContext.Provider>
  );
};
