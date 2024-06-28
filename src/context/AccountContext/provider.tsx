import {
  useState,
  useEffect,
  useMemo,
  useContext,
  useCallback,
  useRef,
} from 'react';
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
import {
  IInfoByKey,
  IExternalIdentity,
  EExternalIdentityStatus,
} from './constants';
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
  const keyRecordRef = useRef<
    Record<
      string,
      {
        account: Account | MultiSigInstance;
        relationship: AccountIdentityRelation;
      }
    >
  >({});
  const extensionRef = useRef<string>('');
  const accountRef = useRef<Account | MultiSigInstance | null>(null);

  const [externalKey, setExternalKey] = useLocalStorage('externalKey', '');
  const [externalIdentity, setExternalIdentity] =
    useState<null | IExternalIdentity>(null);

  const setExternalAccounKey = useCallback(
    (address: string) => {
      setExternalKey(address);
      setSelectedAccount(address);
    },
    [setExternalKey],
  );

  useEffect(() => {
    if (externalIdentity?.status !== EExternalIdentityStatus.PENDING) {
      return undefined;
    }
    const pollingInterval = setInterval(async () => {
      const externalIdentityData =
        await fetchExternalIdentityStatus(selectedAccount);
      setExternalIdentity(externalIdentityData);
    }, 10000);

    return () => clearInterval(pollingInterval);
  }, [externalIdentity?.status, selectedAccount]);

  // Perform actions when account change occurs in extension
  useEffect(() => {
    if (!signingManager) {
      setAllAccounts([]);
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
        setAllAccounts(
          filteredNewAccounts.map((acc) => acc.address.toString()),
        );
        setAllAccountsWithMeta(filteredNewAccounts);
      } catch (error) {
        notifyGlobalError((error as Error).message);
        setAllAccounts([]);
        setAllAccountsWithMeta([]);
      }
    }, true);

    return () => (unsubCb ? unsubCb() : undefined);
  }, [blockedWallets, signingManager]);

  // Set the selected account on initialization
  useEffect(() => {
    if (selectedAccount) {
      return;
    }
    if (defaultAccount) {
      setSelectedAccount(defaultAccount);
      return;
    }
    if (allAccounts.length > 0) {
      setSelectedAccount(allAccounts[0]);
      return;
    }
    setSelectedAccount('');
  }, [allAccounts, defaultAccount, externalKey, selectedAccount]);

  useEffect(() => {
    if (rememberSelectedAccount === true && selectedAccount) {
      setDefaultAccount(selectedAccount);
    }
  }, [rememberSelectedAccount, selectedAccount, setDefaultAccount]);

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
      try {
        if (accountRef.current?.address !== selectedAccount) {
          const accountInstance = await sdk.accountManagement.getAccount({
            address: selectedAccount,
          });
          setAccount(accountInstance);
          accountRef.current = accountInstance;
        }
        const signingKeys = signingManager
          ? await signingManager.getAccounts()
          : [];
        const filteredSigningKeys = signingKeys.filter(
          (key) => !blockedWallets.includes(key),
        );
        // check if the key is in the signing manager's keys
        if (filteredSigningKeys.includes(selectedAccount)) {
          // if the signing manager has changed connect the new signingManager
          if (extensionRef.current !== defaultExtension) {
            await sdk.setSigningManager(signingManager);
          }
          await sdk.setSigningAccount(accountRef.current);
          extensionRef.current = defaultExtension;
        } else {
          // if the key is not in all accounts (the signingManager)
          // ensure there is no signing manager attached to the SDK
          // TODO: check me
          // await sdk.setSigningManager(null);
        }

        const multiSigInstance = await accountRef.current.getMultiSig();
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
  }, [blockedWallets, defaultExtension, sdk, selectedAccount, signingManager]);

  // Update accounts and key to identity relationships for new keys
  useEffect(() => {
    if (!sdk || (!allAccounts.length && !account)) {
      setAllSigningAccounts([]);
      setKeyIdentityRelationships({});
      keyRecordRef.current = {};
      return;
    }

    (async () => {
      try {
        const previousKeyToAccountRecord = keyRecordRef.current;

        const keyArray = [...allAccounts];
        if (account && !keyArray.includes(account.address)) {
          keyArray.push(account.address);
        }

        const addedKeys = keyArray.filter(
          (acc) => !previousKeyToAccountRecord[acc],
        );

        const addedAccountsPromises = addedKeys.map((address) =>
          sdk.accountManagement.getAccount({ address }),
        );
        const addedAccounts = await Promise.all(addedAccountsPromises);

        const addedAccRelationshipsPromises = addedAccounts.map(async (acc) => {
          const { relation } = await acc.getTypeInfo();
          return { address: acc.address, relation };
        });
        const addedAccRelationships = await Promise.all(
          addedAccRelationshipsPromises,
        );

        const newKeyRecord = { ...previousKeyToAccountRecord };
        // Remove entries for keys no longer in keyArray
        Object.keys(newKeyRecord).forEach((key) => {
          if (!keyArray.includes(key)) {
            delete newKeyRecord[key];
          }
        });
        addedAccounts.forEach((acc, idx) => {
          const { address } = acc;
          newKeyRecord[address] = {
            account: acc,
            relationship: addedAccRelationships[idx].relation,
          };
        });

        // Prepare the final lists of signing accounts and relationships
        const signingAccounts = keyArray.map(
          (address) => newKeyRecord[address].account,
        );
        const relationships: Record<string, AccountIdentityRelation> = {};
        keyArray.forEach((address) => {
          relationships[address] = newKeyRecord[address].relationship;
        });

        setAllSigningAccounts(signingAccounts);
        setKeyIdentityRelationships(relationships);
        keyRecordRef.current = newKeyRecord;
      } catch (error) {
        notifyGlobalError((error as Error).message);
        setAllSigningAccounts([]);
        setKeyIdentityRelationships({});
        keyRecordRef.current = {};
      }
    })();
  }, [account, allAccounts, sdk]);

  // Get identity data when sdk is initialized
  useEffect(() => {
    if (accountLoading) return;
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
          const externalIdentityData = await fetchExternalIdentityStatus(
            account.address,
          );
          setExternalIdentity(externalIdentityData);
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
      externalKey,
      externalIdentity,
      setExternalAccounKey,
      isExternalConnection: !allAccounts.includes(selectedAccount),
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
      externalIdentity,
      externalKey,
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
      setExternalAccounKey,
      setRememberSelectedAccount,
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
