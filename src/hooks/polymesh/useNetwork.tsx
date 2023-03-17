import { useContext, useState, useEffect } from 'react';
import { NetworkProperties } from '@polymeshassociation/browser-extension-signing-manager/types';
import { PolymeshContext } from '~/context/PolymeshContext';

const useNetwork = () => {
  const {
    state: { connecting },
    api: { sdk, signingManager },
  } = useContext(PolymeshContext);
  const [network, setNetwork] = useState<NetworkProperties>();
  const [networkName, setNetworkName] = useState('');
  const [networkLoading, setNetworkLoading] = useState(true);
  const [networkError, setNetworkError] = useState('');

  useEffect(() => {
    if (connecting || !sdk) return undefined;

    (async () => {
      try {
        const networkInfo = await sdk.network.getNetworkProperties();

        setNetwork(networkInfo);
        setNetworkName(networkInfo.name.replace('Polymesh', '').trim());
      } catch (error: Error) {
        setNetworkError(error.message);
      } finally {
        setNetworkLoading(false);
      }
    })();

    if (signingManager.extension.name !== 'polywallet') return undefined;

    const unsubCb = signingManager.onNetworkChange(() => {
      setNetwork(newNetwork);
    });

    return () => unsubCb();
  }, [connecting, sdk, signingManager]);

  return { network, networkName, setNetwork, networkLoading, networkError };
};

export default useNetwork;
