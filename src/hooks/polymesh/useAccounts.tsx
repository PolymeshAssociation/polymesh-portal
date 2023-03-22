import { useState, useEffect, useContext } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';

const useAccounts = () => {
  const {
    state: { initialized, selectedAccount, setSelectedAccount },
    api: { sdk, signingManager },
  } = useContext(PolymeshContext);
  const [allAccounts, setAllAccounts] = useState<string[]>([]);

  // Get list of connected accounts when sdk is initialized with signing manager
  useEffect(() => {
    if (!initialized || !sdk || !signingManager) return;

    (async () => {
      const connectedAccounts = await signingManager.getAccounts();
      setAllAccounts(connectedAccounts);
    })();
  }, [initialized, sdk, signingManager]);

  // Perform actions when account change occurs in extension
  useEffect(() => {
    if (!initialized || !signingManager) return undefined;

    const unsubCb = signingManager.onAccountChange(async (newAccounts) => {
      setAllAccounts(newAccounts);
    });

    return () => unsubCb();
  }, [initialized, signingManager]);

  // Set selected account when account array changes
  useEffect(() => {
    if (!allAccounts.length) return;

    setSelectedAccount(allAccounts[0]);
  }, [allAccounts, setSelectedAccount]);

  // Set signer account when manually changing account in app
  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    if (!selectedAccount || !sdk || sdk._signingAddress === selectedAccount)
      return;

    (async () => {
      await sdk.setSigningAccount(selectedAccount);
    })();
  }, [sdk, selectedAccount]);

  return { allAccounts, selectedAccount, setSelectedAccount };
};

export default useAccounts;
