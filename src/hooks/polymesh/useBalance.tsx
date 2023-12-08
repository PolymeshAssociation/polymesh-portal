import { useContext, useEffect, useState } from 'react';
import { UnsubCallback } from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';

interface IParsedBalance {
  free: string;
  locked: string;
  total: string;
}

interface IUseBalance {
  balance: IParsedBalance;
  balanceError: string;
  balanceIsLoading: boolean;
}

const useBalance = (address?: string): IUseBalance => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { selectedAccount } = useContext(AccountContext);
  const [balance, setBalance] = useState<IParsedBalance>({
    free: '',
    locked: '',
    total: '',
  });
  const [balanceError, setBalanceError] = useState('');
  const [balanceIsLoading, setBalanceIsLoading] = useState(true);

  const targetAccount = address || selectedAccount;

  // Get balance data when accounts are set
  useEffect(() => {
    if (!sdk || !targetAccount) return undefined;

    let unsubCb: UnsubCallback | null = null;
    (async () => {
      try {
        setBalanceIsLoading(true);
        unsubCb = await sdk.accountManagement.getAccountBalance(
          {
            account: targetAccount,
          },
          ({ free, locked, total }) => {
            setBalance({
              free: free.toString(),
              locked: locked.toString(),
              total: total.toString(),
            });
          },
        );
      } catch (error) {
        if (error instanceof Error) {
          setBalanceError(error.message);
        } else {
          throw error;
        }
      } finally {
        setBalanceIsLoading(false);
      }
    })();

    return () => (unsubCb ? unsubCb() : undefined);
  }, [targetAccount, sdk]);

  return { balance, balanceError, balanceIsLoading };
};

export default useBalance;
