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
  const [identityLoading, setIdentityLoading] = useState(true);
  const [allKeyBalances, setAllKeyBalances] = useState<IBalanceByKey[]>([]);
  const [identityHasValidCdd, setIdentityHasValidCdd] =
    useState<boolean>(false);
  const [accountIsMultisigSigner, setAccountIsMultisigSigner] =
    useState<boolean>(false);

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

  // Set selected account when account array changes
  useEffect(() => {
    if (!allAccounts.length) return;
        setSelectedAccount(allAccounts[0]);
  }, [allAccounts]);

  // Set account instance when selected account changes
  useEffect(() => {
    if (!selectedAccount || !sdk) return;

    (async () => {
      try {
        const accountInstance = await sdk.accountManagement.getAccount({
          address: selectedAccount,
        });

        setAccount(accountInstance);
        await sdk.setSigningAccount(accountInstance);

        const multiSig = await accountInstance.getMultiSig();
        setAccountIsMultisigSigner(!!multiSig);

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
        const allAccIdentities = await Promise.all(
          signingAccounts.map((acc) => acc.getIdentity()),
        );

        // Place the selected account's identity at the first index of the array
        if (accIdentity !== null) {
          allAccIdentities.unshift(accIdentity);
        }
        // Filter out duplicate or null identities
        const uniqueIdentities = allAccIdentities.filter((id, index, self) => {
          return (
            id !== null &&
            index ===
              self.findIndex((otherId) => otherId && otherId.did === id.did)
          );
        });

        setIdentity(accIdentity);
        setAllIdentities(uniqueIdentities);
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

  // Check identity CDD status
  useEffect(() => {
      if (!identity) {
        setIdentityHasValidCdd(false);
        return;
      }

    const fetchCddStatus = async () => {
      setIdentityHasValidCdd(await identity.hasValidCdd());
    };

    fetchCddStatus();
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
      identityHasValidCdd,
      accountIsMultisigSigner,
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
      identityHasValidCdd,
      accountIsMultisigSigner,
    ],
  );

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider;
