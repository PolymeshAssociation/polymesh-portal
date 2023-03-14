import { useContext, useState, useEffect } from 'react';
import { NetworkInfo } from '@polymeshassociation/browser-extension-signing-manager/types';
import { PolymeshContext } from '~/context/PolymeshContext';

const useNetwork = () => {
  const {
    state: { connecting },
    api: { signingManager },
  } = useContext(PolymeshContext);
  const [network, setNetwork] = useState<NetworkInfo>();
  const [networkLoading, setNetworkLoading] = useState(true);
  const [networkError, setNetworkError] = useState('');

  useEffect(() => {
    if (connecting || !signingManager) return undefined;

    (async () => {
      try {
        const networkInfo = await signingManager.extension.network.get();
        setNetwork(networkInfo);
      } catch (error: Error) {
        setNetworkError(error.message);
      } finally {
        setNetworkLoading(false);
      }
    })();

    const unsubCb = signingManager.onNetworkChange((newNetwork) => {
      setNetwork(newNetwork);
    });
    return () => {
      unsubCb();
    };
  }, [connecting, signingManager]);

  return { network, setNetwork, networkLoading, networkError };
};

export default useNetwork;
