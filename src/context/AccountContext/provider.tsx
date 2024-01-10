import { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import {
  Account,
  MultiSig,
  Identity,
  UnsubCallback,
} from '@polymeshassociation/polymesh-sdk/types';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { MultiSig as MultiSigInstance } from '@polymeshassociation/polymesh-sdk/internal';
import {
  AccountKeyType,
  AccountIdentityRelation,
} from '@polymeshassociation/polymesh-sdk/api/entities/Account/types';
import { PolymeshContext } from '../PolymeshContext';
import AccountContext from './context';
import { notifyGlobalError } from '~/helpers/notifications';
import { IInfoByKey } from './constants';
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
  const [multiSigAccount, setMultiSigAccount] = useState<MultiSig | null>(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [allAccounts, setAllAccounts] = useState<string[]>([]);
  const [allAccountsWithMeta, setAllAccountsWithMeta] = useState<
    InjectedAccountWithMeta[]
  >([]);
  const [allSigningAccounts, setAllSigningAccounts] = useState<Account[]>([]);
  const [keyIdentityRelationships, setKeyIdentityRelationships] = useState<
    Record<string, AccountIdentityRelation>
  >({});
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
  const [accountLoading, setAccountLoading] = useState(true);
  const [identityLoading, setIdentityLoading] = useState(true);
  const [allKeyInfo, setAllKeyInfo] = useState<IInfoByKey[]>([]);
  const [identityHasValidCdd, setIdentityHasValidCdd] =
    useState<boolean>(false);
  const [accountIsMultisigSigner, setAccountIsMultisigSigner] =
    useState<boolean>(false);
  const [shouldRefreshIdentity, setShouldRefreshIdentity] = useState(true);

  // Get list of connected accounts from the signing manager
  useEffect(() => {
    if (!signingManager) {
      setAllAccounts([]);
      setAllAccountsWithMeta([]);
      return;
    }
    (async () => {
      // This is only applicable to the polywallet as other wallets return `newAccounts` on initial subscription
      if (defaultExtension !== 'polywallet') return;
      try {
        const connectedAccounts = await signingManager.getAccounts();
        const accountsWithMeta = await signingManager.getAccountsWithMeta();

        if (!connectedAccounts.length) {
          throw new Error('No injected accounts found in the connected wallet');
        }
        const filteredAccounts = connectedAccounts.filter(
          (address) => !blockedWallets.includes(address),
        );
        if (!filteredAccounts.length) {
          throw new Error(
            'All injected accounts are in your blocked accounts list',
          );
        }
        const filteredAccountsWithMeta = accountsWithMeta.filter(
          (accountWithMeta) =>
            !blockedWallets.includes(accountWithMeta.address),
        );
        setAllAccounts(filteredAccounts);
        setAllAccountsWithMeta(filteredAccountsWithMeta);
      } catch (error) {
        notifyGlobalError((error as Error).message);
        setAllAccounts([]);
        setAllAccountsWithMeta([]);
      }
    })();
  }, [signingManager, blockedWallets, defaultExtension]);

  // Perform actions when account change occurs in extension
  useEffect(() => {
    // Flag to track mounted state as the Polywallet onAccountChange unsub function doesn't work
    // TODO: remove flag when the polywallet is fixed to correctly unsubscribe
    let isMounted = true;

    if (!signingManager) {
      setAllAccounts([]);
      setAllAccountsWithMeta([]);
      return () => {
        isMounted = false;
      };
    }

    const unsubCb = signingManager.onAccountChange(async (newAccounts) => {
      try {
        if (!newAccounts.length) {
          throw new Error('No injected accounts found in the connected wallet');
        }

        const filteredNewAccounts = (
          newAccounts as InjectedAccountWithMeta[]
        ).filter(
          (accountWithMeta) =>
            !blockedWallets.includes(accountWithMeta.address),
        );
        if (!filteredNewAccounts.length) {
          throw new Error(
            'All injected accounts are in your blocked accounts list',
          );
        }
        if (isMounted) {
          setAllAccounts(
            filteredNewAccounts.map((acc) => acc.address.toString()),
          );
          setAllAccountsWithMeta(filteredNewAccounts);
        }
      } catch (error) {
        notifyGlobalError((error as Error).message);
        if (isMounted) {
          setAllAccounts([]);
          setAllAccountsWithMeta([]);
        }
      }
    }, true);

    return () => {
      isMounted = false;
      unsubCb();
    };
  }, [blockedWallets, signingManager]);

  // Set a new selected account only if the previously account
  // is no longer in the list of connected accounts
  useEffect(() => {
    if (!allAccounts.length) {
      setSelectedAccount('');
      return;
    }
    if (selectedAccount && allAccounts.includes(selectedAccount)) {
      return;
    }
    if (allAccounts.includes(defaultAccount)) {
      setSelectedAccount(defaultAccount);
      return;
    }
    setSelectedAccount(allAccounts[0]);
  }, [allAccounts, defaultAccount, selectedAccount]);

  useEffect(() => {
    const rememberSelectedAccount = localStorage.getItem(
      'rememberSelectedAccount',
    );
    if (rememberSelectedAccount === 'true' && selectedAccount) {
      setDefaultAccount(selectedAccount);
    }
  }, [selectedAccount, setDefaultAccount]);

  // Set account instance when selected account changes
  useEffect(() => {
    if (!sdk || !selectedAccount) {
      setAccount(null);
      return;
    }

    setAccountLoading(true);
    (async () => {
      try {
        const accountInstance = await sdk.accountManagement.getAccount({
          address: selectedAccount,
        });

        setAccount(accountInstance);
        await sdk.setSigningAccount(accountInstance);

        const multiSigInstance = await accountInstance.getMultiSig();
        setMultiSigAccount(multiSigInstance);
        setAccountIsMultisigSigner(!!multiSigInstance);
        setShouldRefreshIdentity(true);
      } catch (error) {
        notifyGlobalError((error as Error).message);
        setAccount(null);
        setMultiSigAccount(null);
        setAccountIsMultisigSigner(false);
      } finally {
        setAccountLoading(false);
      }
    })();
  }, [sdk, selectedAccount]);

  useEffect(() => {
    if (!sdk || !allAccounts.length) {
      setAllSigningAccounts([]);
      setKeyIdentityRelationships({});
      return;
    }

    (async () => {
      try {
        const signingAccounts =
          await sdk.accountManagement.getSigningAccounts();

        const relationshipPromises = signingAccounts.map(async (acc) => {
          const { relation } = await acc.getTypeInfo();
          const { address } = acc;
          return { address, relation };
        });

        const relationshipsArray = await Promise.all(relationshipPromises);

        const relationships: Record<string, AccountIdentityRelation> = {};
        relationshipsArray.forEach(({ address, relation }) => {
          relationships[address] = relation;
        });

        setAllSigningAccounts(signingAccounts);
        setKeyIdentityRelationships(relationships);
      } catch (error) {
        notifyGlobalError((error as Error).message);
        setAllSigningAccounts([]);
        setKeyIdentityRelationships({});
      }
    })();
  }, [allAccounts, sdk]);

  // Get identity data when sdk is initialized
  useEffect(() => {
    if (!account || !sdk || !initialized || !allSigningAccounts.length) {
      setIdentity(null);
      setAllIdentities([]);
      return;
    }

    if (!shouldRefreshIdentity) return;

    (async () => {
      try {
        setIdentityLoading(true);

        const accIdentity = await account.getIdentity();
        const allAccIdentities = await Promise.all(
          allSigningAccounts.map((acc) => acc.getIdentity()),
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
        setIdentity(null);
        setAllIdentities([]);
      } finally {
        setIdentityLoading(false);
        setShouldRefreshIdentity(false);
      }
    })();
  }, [sdk, account, shouldRefreshIdentity, initialized, allSigningAccounts]);

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
    if (!sdk || !primaryKey || identityLoading) return;

    (async () => {
      const balancesByKey = await Promise.all(
        [primaryKey, ...secondaryKeys].map(async (key) => {
          const acc = await sdk.accountManagement.getAccount({
            address: key,
          });

          const keyInfo = await acc.getTypeInfo();
          const { keyType, relation: keyIdentityRelationship } = keyInfo;
          const isMultiSig = keyType === AccountKeyType.MultiSig;
          let multisigDetails = null;

          if (keyType === AccountKeyType.MultiSig) {
            multisigDetails = await (acc as MultiSigInstance).details();
          }

          return {
            // Mark keys that are available in connected extension
            available: !!allAccounts.includes(key),
            isMultiSig,
            key,
            keyIdentityRelationship,
            keyType,
            multisigDetails,
            totalBalance: (
              await sdk.accountManagement.getAccountBalance({
                account: key,
              })
            ).total?.toString(),
          };
        }),
      );

      setAllKeyInfo(balancesByKey);
    })();
  }, [allAccounts, identityLoading, primaryKey, sdk, secondaryKeys]);

  const blockWalletAddress = useCallback(
    (address: string) => {
      setBlockedWallets((prev) => {
        return [...prev, address];
      });
    },
    [setBlockedWallets],
  );

  const unblockWalletAddress = useCallback(
    (address: string) => {
      setBlockedWallets((prev) =>
        prev.filter((blockedAddress) => blockedAddress !== address),
      );
    },
    [setBlockedWallets],
  );

  const refreshAccountIdentity = useCallback(() => {
    setShouldRefreshIdentity(true);
  }, [setShouldRefreshIdentity]);

  const contextValue = useMemo(
    () => ({
      account,
      selectedAccount,
      allAccounts,
      allAccountsWithMeta,
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
      accountLoading,
      identityLoading,
      allKeyInfo,
      identityHasValidCdd,
      accountIsMultisigSigner,
      refreshAccountIdentity,
      keyIdentityRelationships,
      multiSigAccount,
    }),
    [
      account,
      accountIsMultisigSigner,
      accountLoading,
      allAccounts,
      allAccountsWithMeta,
      allIdentities,
      allKeyInfo,
      blockWalletAddress,
      blockedWallets,
      defaultAccount,
      identity,
      identityHasValidCdd,
      identityLoading,
      keyIdentityRelationships,
      multiSigAccount,
      primaryKey,
      refreshAccountIdentity,
      secondaryKeys,
      selectedAccount,
      setDefaultAccount,
      unblockWalletAddress,
    ],
  );

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider;
