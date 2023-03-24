import { useState, useEffect, useMemo, useContext } from 'react';
import {
  Account,
  MultiSig,
  Identity,
  UnsubCallback,
} from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshContext } from '../PolymeshContext';
import AccountContext from './context';
import { notifyError } from '~/helpers/notifications';
import { IBalanceByKey } from './constants';

interface IProviderProps {
  children: React.ReactNode;
}

const AccountProvider = ({ children }: IProviderProps) => {
  const {
    api: { sdk, signingManager },
    state: { initialized },
  } = useContext(PolymeshContext);
  const [account, setAccount] = useState<Account | MultiSig | null>(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [allAccounts, setAllAccounts] = useState<string[]>([]);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [allIdentities, setAllIdentities] = useState<(Identity | null)[]>([]);
  const [primaryKey, setPrimaryKey] = useState<string>('');
  const [secondaryKeys, setSecondaryKeys] = useState<string[]>([]);
  const [identityLoading, setIdentityLoading] = useState(false);
  const [allKeyBalances, setAllKeyBalances] = useState<IBalanceByKey[]>([]);

  // Get list of connected accounts when sdk is initialized with signing manager
  useEffect(() => {
    if (!initialized || !signingManager) return;

    (async () => {
      try {
        const connectedAccounts = await signingManager.getAccounts();
        setAllAccounts(connectedAccounts);
      } catch (error) {
        notifyError((error as Error).message);
      }
    })();
  }, [initialized, signingManager]);

  // Perform actions when account change occurs in extension
  useEffect(() => {
    if (!initialized || !signingManager) return undefined;

    const unsubCb = signingManager.onAccountChange(async (newAccounts) => {
      setAllAccounts(newAccounts);
    });

    return () => unsubCb();
  }, [initialized, signingManager]);

  // Set selected account and account instance when account array changes
  useEffect(() => {
    if (!sdk || !allAccounts.length) return;

    (async () => {
      try {
        const accountInstance = await sdk.accountManagement.getAccount({
          address: allAccounts[0],
        });

        setAccount(accountInstance);
        setSelectedAccount(allAccounts[0]);
      } catch (error) {
        notifyError((error as Error).message);
      }
    })();
  }, [allAccounts, sdk]);

  // Set account instance when manually changing account in app
  useEffect(() => {
    if (!selectedAccount || !sdk) return;

    (async () => {
      try {
        const accountInstance = await sdk.accountManagement.getAccount({
          address: selectedAccount,
        });

        setAccount(accountInstance);
      } catch (error) {
        notifyError((error as Error).message);
      }
    })();
  }, [sdk, selectedAccount]);

  // Get identity data when sdk is initialized
  useEffect(() => {
    if (!account || !sdk) return;

    (async () => {
      try {
        setIdentityLoading(true);

        const signingAccounts =
          await sdk.accountManagement.getSigningAccounts();

        const accIdentity = await account.getIdentity();

        const allAccIdentities = (
          await Promise.all(signingAccounts.map((acc) => acc.getIdentity()))
        ).filter((option) => option !== null);

        setIdentity(accIdentity);
        setAllIdentities(allAccIdentities);

        // Set signer if selected key has assigned identity
        // eslint-disable-next-line no-underscore-dangle
        if (accIdentity && sdk._signingAddress === account.address) {
          await sdk.setSigningAccount(account.address);
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setIdentityLoading(false);
      }
    })();
  }, [sdk, account]);

  // Subscribe to primary identity keys
  useEffect(() => {
    if (!identity) {
      return setPrimaryKey('');
    }

    let unsubCb: UnsubCallback;

    (async () => {
      unsubCb = await identity.getPrimaryAccount((primaryAccount) => {
        setPrimaryKey(primaryAccount.account.address);
      });
    })();

    return () => (unsubCb ? unsubCb() : undefined);
  }, [identity]);

  // Subscribe to secondary identity keys
  useEffect(() => {
    if (!identity) {
      return setSecondaryKeys([]);
    }

    let unsubCb: UnsubCallback;

    (async () => {
      unsubCb = await identity.getSecondaryAccounts((secondaryAccounts) => {
        const keys = secondaryAccounts.map(
          ({ account: { address } }) => address,
        );
        setSecondaryKeys(keys);
      });
    })();

    return () => (unsubCb ? unsubCb() : undefined);
  }, [identity]);

  // Get total balance for all keys associated with current DID
  useEffect(() => {
    if (!sdk || !primaryKey) return;

    (async () => {
      const balancesByKey = await Promise.all(
        [primaryKey, ...secondaryKeys].map(async (key) => ({
          key,
          totalBalance: (
            await sdk.accountManagement.getAccountBalance({
              account: key,
            })
          ).total?.toString(),
          // Mark keys that are available in connected extension
          available: !!allAccounts.includes(key),
        })),
      );

      setAllKeyBalances(balancesByKey);
    })();
  }, [allAccounts, primaryKey, sdk, secondaryKeys]);

  const contextValue = useMemo(
    () => ({
      account,
      selectedAccount,
      allAccounts,
      setSelectedAccount,
      identity,
      allIdentities,
      primaryKey,
      secondaryKeys,
      identityLoading,
      allKeyBalances,
    }),
    [
      account,
      selectedAccount,
      allAccounts,
      identity,
      allIdentities,
      primaryKey,
      secondaryKeys,
      identityLoading,
      allKeyBalances,
    ],
  );

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider;
