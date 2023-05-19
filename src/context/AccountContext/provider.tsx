import { useState, useEffect, useMemo, useContext, useRef } from 'react';
import {
  Account,
  MultiSig,
  Identity,
  UnsubCallback,
} from '@polymeshassociation/polymesh-sdk/types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { PolymeshContext } from '../PolymeshContext';
import AccountContext from './context';
import { notifyGlobalError } from '~/helpers/notifications';
import { IBalanceByKey } from './constants';
import { useLocalStorage } from '~/hooks/utility';

interface IProviderProps {
  children: React.ReactNode;
}

const AccountProvider = ({ children }: IProviderProps) => {
  const {
    api: { sdk, signingManager },
    state: { initialized },
    settings: { defaultExtension },
  } = useContext(PolymeshContext);
  const [account, setAccount] = useState<Account | MultiSig | null>(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [allAccounts, setAllAccounts] = useState<string[]>([]);
  const [allAccountsWithMeta, setAllAccountsWithMeta] = useState<
    InjectedAccountWithMeta[]
  >([]);
  const [defaultAccount, setDefaultAccount] = useLocalStorage(
    'defaultAccount',
    '',
  );
  const [blockedWallets, setBlockedWallets] = useLocalStorage<string[]>(
    'blockedWallets',
    [],
  );
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
  const signerRef = useRef<string>(defaultAccount);

  // Get list of connected accounts when sdk is initialized with signing manager
  useEffect(() => {
    if (!sdk || !initialized || !signingManager) return;

    setSelectedAccount('');
    setPrimaryKey('');
    setAllAccounts([]);
    setAllAccountsWithMeta([]);
    (async () => {
      try {
        const connectedAccounts = await signingManager.getAccounts();
        const accountsWithMeta = await signingManager.getAccountsWithMeta();

        const filteredAccounts = connectedAccounts.filter(
          (address) => !blockedWallets.includes(address),
        );
        const filteredAccountsWithMeta = accountsWithMeta.filter(
          (accountWithMeta) =>
            !blockedWallets.includes(accountWithMeta.address),
        );
        setAllAccounts(filteredAccounts);
        setAllAccountsWithMeta(filteredAccountsWithMeta);
      } catch (error) {
        notifyGlobalError((error as Error).message);
      }
    })();
  }, [sdk, initialized, signingManager, blockedWallets]);

  // Perform actions when account change occurs in extension
  useEffect(() => {
    if (!initialized || !signingManager) return undefined;

    const unsubCb = signingManager.onAccountChange(async (newAccounts) => {
      if (
        blockedWallets.includes(
          (newAccounts as InjectedAccountWithMeta[])[0].address,
        )
      ) {
        notifyGlobalError(
          'The wallet selected account is in your list of blocked accounts',
        );
        return;
      }

      const filteredNewAccounts = (
        newAccounts as InjectedAccountWithMeta[]
      ).filter(
        (accountWithMeta) => !blockedWallets.includes(accountWithMeta.address),
      );
      const [firstAccount] = filteredNewAccounts;
      signerRef.current = firstAccount?.address;
      setAllAccounts(filteredNewAccounts.map((acc) => acc.address.toString()));
      setAllAccountsWithMeta(filteredNewAccounts);
    }, true);

    return () => unsubCb();
  }, [blockedWallets, initialized, signingManager]);

  // Update signerRef when default account value changes
  useEffect(() => {
    if (!defaultAccount) return;

    signerRef.current = defaultAccount;
  }, [defaultAccount, defaultExtension]);

  // Set selected account when account array changes
  useEffect(() => {
    if (!allAccounts.length) {
      setSelectedAccount('');
      return;
    }

    if (
      signerRef.current === defaultAccount &&
      allAccounts.includes(defaultAccount) &&
      !blockedWallets.includes(defaultAccount)
    ) {
      setSelectedAccount(defaultAccount);
      return;
    }

    setSelectedAccount(allAccounts[0]);
  }, [allAccounts, defaultAccount, blockedWallets]);

  // Set account instance when selected account changes
  useEffect(() => {
    if (!sdk || !selectedAccount) {
      setAccount(null);
      return;
    }

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
        notifyGlobalError((error as Error).message);
      }
    })();
  }, [sdk, selectedAccount]);

  // Get identity data when sdk is initialized
  useEffect(() => {
    if (!account || !sdk) {
      setIdentity(null);
      setAllIdentities([]);
      return;
    }

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
        notifyGlobalError((error as Error).message);
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

  const blockWalletAddress = (address: string) => {
    setBlockedWallets((prev) => {
      return [...prev, address];
    });
  };

  const unblockWalletAddress = (address: string) => {
    setBlockedWallets((prev) =>
      prev.filter((blockedAddress) => blockedAddress !== address),
    );
  };

  const contextValue = useMemo(
    () => ({
      account,
      selectedAccount,
      allAccounts: allAccounts.filter(
        (address) => !blockedWallets.includes(address),
      ),
      allAccountsWithMeta: allAccountsWithMeta.filter(
        ({ address }) => !blockedWallets.includes(address),
      ),
      setSelectedAccount,
      defaultAccount,
      setDefaultAccount,
      blockedWallets,
      blockWalletAddress,
      unblockWalletAddress,
      identity,
      allIdentities,
      primaryKey,
      secondaryKeys,
      identityLoading,
      allKeyBalances,
      identityHasValidCdd,
      accountIsMultisigSigner,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      account,
      selectedAccount,
      allAccounts,
      allAccountsWithMeta,
      identity,
      allIdentities,
      defaultAccount,
      setDefaultAccount,
      blockedWallets,
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
