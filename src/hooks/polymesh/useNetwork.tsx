import { useContext, useState, useEffect } from 'react';
import { NetworkProperties } from '@polymeshassociation/polymesh-sdk/types';
import { NetworkInfo } from '@polymeshassociation/browser-extension-signing-manager/types';
import { PolymeshContext } from '~/context/PolymeshContext';

const useNetwork = () => {
  const {
    state: { connecting },
    api: { sdk, signingManager },
  } = useContext(PolymeshContext);
  const [network, setNetwork] = useState<NetworkProperties | NetworkInfo>();
  const [networkName, setNetworkName] = useState('');
  const [networkLoading, setNetworkLoading] = useState(true);
  const [networkError, setNetworkError] = useState('');

  useEffect(() => {
    if (connecting || !sdk || !signingManager) return undefined;

    (async () => {
      try {
        const networkInfo = await sdk.network.getNetworkProperties();

        setNetwork(networkInfo);
        setNetworkName(networkInfo.name.replace('Polymesh', '').trim());
      } catch (error) {
        setNetworkError((error as Error).message);
      } finally {
        setNetworkLoading(false);
      }
    })();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (signingManager.extension.name !== 'polywallet') return undefined;

    const unsubCb = signingManager.onNetworkChange((newNetwork) => {
      setNetwork(newNetwork);
    });

    return () => unsubCb();
  }, [connecting, sdk, signingManager]);

  return { network, networkName, setNetwork, networkLoading, networkError };
};

export default useNetwork;
