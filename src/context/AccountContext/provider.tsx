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
import { IInfoByKey, IExternalIdentity } from './constants';
import { useLocalStorage } from '~/hooks/utility';
import { useBalance } from '~/hooks/polymesh';
import { fetchExternalIdentityStatus } from './helpers';

interface IProviderProps {
  children: React.ReactNode;
}

const AccountProvider = ({ children }: IProviderProps) => {
  const {
    api: { sdk, signingManager },
    state: { initialized },
    // settings: { defaultExtension },
    externalConnection,
    connectAccount,
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
  const [rememberSelectedAccount, setRememberSelectedAccount] = useLocalStorage(
    'rememberSelectedAccount',
    true,
  );

  const [identity, setIdentity] = useState<Identity | null>(null);
  const [allIdentities, setAllIdentities] = useState<(Identity | null)[]>([]);
  const [primaryKey, setPrimaryKey] = useState<string>('');
  const [secondaryKeys, setSecondaryKeys] = useState<string[]>([]);
  const [accountLoading, setAccountLoading] = useState(true);
  const [identityLoading, setIdentityLoading] = useState(true);
  const [primaryKeyLoading, setPrimaryKeyLoading] = useState(true);
  const [secondaryKeysLoading, setSecondaryKeysLoading] = useState(true);
  const [allKeyInfo, setAllKeyInfo] = useState<IInfoByKey[]>([]);
  const [identityHasValidCdd, setIdentityHasValidCdd] =
    useState<boolean>(false);
  const [accountIsMultisigSigner, setAccountIsMultisigSigner] =
    useState<boolean>(false);
  const [shouldRefreshIdentity, setShouldRefreshIdentity] = useState(true);
  const { balance: selectedAccountBalance, balanceIsLoading } =
    useBalance(selectedAccount);

  const [externalKey, setExternalKey] = useLocalStorage('externalKey', '');
  const [externalIdentity, setExternalIdentity] =
    useState<null | IExternalIdentity>(null);

  const setExternalKeyAccount = useCallback(
    async (externalAddress: string) => {
      await connectAccount(true);
      setSelectedAccount(externalAddress);
      // setDefaultAccount(externalAddress);
      setExternalKey(externalAddress);
      if (!allAccounts.includes(externalAddress)) {
        setAllAccounts([...allAccounts, externalAddress]);
      }
      const data = await fetchExternalIdentityStatus(externalAddress);
      setExternalIdentity(data as IExternalIdentity);
      setIdentityLoading(false);
    },
    [connectAccount, setExternalKey, allAccounts],
  );

  // Perform actions when account change occurs in extension
  useEffect(() => {
    if (!signingManager) {
      if (!externalConnection) {
        // TO CHECK: add external account?
        setAllAccounts([]);
      }
      setAllAccountsWithMeta([]);
      return () => {};
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
        const filteredAccount =
          filteredNewAccounts.map((acc) => acc.address.toString()) || [];
        const acc = externalKey
          ? [...filteredAccount, externalKey]
          : filteredAccount;
        setAllAccounts(acc);
        setAllAccountsWithMeta(filteredNewAccounts);
      } catch (error) {
        notifyGlobalError((error as Error).message);
        setAllAccounts([]);
        setAllAccountsWithMeta([]);
      }
    }, true);

    return () => (unsubCb ? unsubCb() : undefined);
  }, [blockedWallets, externalConnection, externalKey, signingManager]);

  // Set a new selected account only if the previously account
  // is no longer in the list of connected accounts
  useEffect(() => {
    if (!allAccounts.length) {
      setSelectedAccount('');
      return;
    }
    if (
      selectedAccount &&
      allAccounts.includes(selectedAccount) &&
      allAccounts.length === 1 &&
      selectedAccount === externalKey
    ) {
      setSelectedAccount(externalKey);
      return;
    }
    if (allAccounts.includes(defaultAccount) && !externalConnection) {
      setSelectedAccount(defaultAccount);
      return;
    }
    setSelectedAccount(selectedAccount);
  }, [
    allAccounts,
    defaultAccount,
    selectedAccount,
    connectAccount,
    externalKey,
    externalConnection,
  ]);

  useEffect(() => {
    if (
      rememberSelectedAccount === true &&
      selectedAccount &&
      externalConnection !== true
    ) {
      if (selectedAccount === externalKey) {
        setDefaultAccount(
          allAccounts.filter((acc) => acc !== externalKey)?.[0] || '',
        );
      } else {
        setDefaultAccount(selectedAccount);
      }
    }
  }, [
    allAccounts,
    externalConnection,
    externalKey,
    rememberSelectedAccount,
    selectedAccount,
    setDefaultAccount,
  ]);

  // Set account instance when selected account changes
  useEffect(() => {
    if (!sdk || !selectedAccount) {
      setAccount(null);
      return;
    }

    setAccountLoading(true);
    setIdentityLoading(true);
    setPrimaryKeyLoading(true);
    setSecondaryKeysLoading(true);

    (async () => {
      if (externalConnection || selectedAccount === externalKey) {
        const accountInstance = await sdk.accountManagement.getAccount({
          address: externalKey,
        });
        setAccount(accountInstance);
        setAccountLoading(false);
        setIdentityLoading(false);
        return;
      }
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
  }, [
    allAccounts,
    connectAccount,
    externalConnection,
    externalKey,
    sdk,
    selectedAccount,
  ]);

  useEffect(() => {
    if (externalConnection || !sdk?.accountManagement) {
      return;
    }
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
  }, [allAccounts, sdk, externalConnection]);

  // Get identity data when sdk is initialized
  useEffect(() => {
    if (accountLoading) return;
    if (externalConnection) {
      setIdentityLoading(false);
      return;
    }
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

        if (!accountLoading) {
          setIdentity(accIdentity);
        }
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
  }, [
    sdk,
    account,
    shouldRefreshIdentity,
    initialized,
    allSigningAccounts,
    accountLoading,
    externalConnection,
  ]);

  // Subscribe to primary identity keys
  useEffect(() => {
    if (identityLoading) return undefined;
    if (!identity) {
      setPrimaryKey('');
      setPrimaryKeyLoading(false);
      return undefined;
    }

    let unsubCb: UnsubCallback;

    (async () => {
      unsubCb = await identity.getPrimaryAccount((primaryAccount) => {
        if (!identityLoading) {
          setPrimaryKey(primaryAccount.account.address);
          setPrimaryKeyLoading(false);
        }
      });
    })();

    return () => (unsubCb ? unsubCb() : undefined);
  }, [identity, identityLoading]);

  // Subscribe to secondary identity keys
  useEffect(() => {
    if (identityLoading) return undefined;
    if (!identity) {
      setSecondaryKeys([]);
      setSecondaryKeysLoading(false);
      return undefined;
    }

    let unsubCb: UnsubCallback;

    (async () => {
      unsubCb = await identity.getSecondaryAccounts((secondaryAccounts) => {
        const keys = secondaryAccounts.map(
          ({ account: { address } }) => address,
        );
        if (!identityLoading) {
          setSecondaryKeys(keys);
          setSecondaryKeysLoading(false);
        }
      });
    })();

    return () => (unsubCb ? unsubCb() : undefined);
  }, [identity, identityLoading]);

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
    if (!sdk || !primaryKey || primaryKeyLoading || secondaryKeysLoading) {
      return;
    }

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
  }, [
    allAccounts,
    primaryKey,
    primaryKeyLoading,
    sdk,
    secondaryKeys,
    secondaryKeysLoading,
  ]);

  useEffect(() => {
    if (!sdk && externalKey && externalConnection) {
      setExternalKeyAccount(externalKey);
    }
  }, [
    sdk,
    selectedAccount,
    externalKey,
    externalConnection,
    setExternalKeyAccount,
  ]);

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
      selectedAccountBalance,
      balanceIsLoading,
      rememberSelectedAccount,
      setRememberSelectedAccount,
      setExternalKeyAccount,
      externalKey,
      externalIdentity,
    }),
    [
      account,
      accountIsMultisigSigner,
      accountLoading,
      allAccounts,
      allAccountsWithMeta,
      allIdentities,
      allKeyInfo,
      balanceIsLoading,
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
      rememberSelectedAccount,
      secondaryKeys,
      selectedAccount,
      selectedAccountBalance,
      setDefaultAccount,
      setRememberSelectedAccount,
      unblockWalletAddress,
      setExternalKeyAccount,
      externalKey,
      externalIdentity,
    ],
  );

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider;
