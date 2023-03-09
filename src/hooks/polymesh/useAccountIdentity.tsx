import { useState, useEffect, useContext } from 'react';
import { Identity } from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshContext } from '~/context/PolymeshContext';

const useAccountIdentity = () => {
  const {
    state: { initialized, selectedAccount },
    api: { sdk },
  } = useContext(PolymeshContext);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [allIdentities, setAllIdentities] = useState<Identity[]>([]);
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
        const signingAccounts =
          await sdk.accountManagement.getSigningAccounts();

        const accIdentity = await account.getIdentity();

        const allAccIdentities = await Promise.all(
          signingAccounts.map((acc) => acc.getIdentity()),
        );

        setIdentity(accIdentity);
        setAllIdentities(allAccIdentities);
      } catch (error) {
        setIdentityError(error.message);
      } finally {
        setIdentityLoading(false);
      }
    })();
  }, [initialized, sdk, selectedAccount]);

  return { identity, allIdentities, identityLoading, identityError };
};

export default useAccountIdentity;
