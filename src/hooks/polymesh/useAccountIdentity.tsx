import { useState, useEffect, useContext } from 'react';
import { Identity } from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshContext } from '~/context/PolymeshContext';

const useAccountIdentity = () => {
  const {
    state: { initialized, selectedAccount },
    api: { sdk },
  } = useContext(PolymeshContext);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [identityLoading, setIdentityLoading] = useState(false);
  const [identityError, setIdentityError] = useState('');

  // Get identity data when sdk is initialized
  useEffect(() => {
    if (!initialized || !selectedAccount) return;

    (async () => {
      try {
        setIdentityLoading(true);
        const account = await sdk.accountManagement.getAccount({
          address: selectedAccount,
        });

        const accIdentity = await account.getIdentity();

        setIdentity(accIdentity);
      } catch (error) {
        setIdentityError(error.message);
      } finally {
        setIdentityLoading(false);
      }
    })();
  }, [initialized, sdk, selectedAccount]);

  return { identity, identityLoading, identityError };
};

export default useAccountIdentity;
