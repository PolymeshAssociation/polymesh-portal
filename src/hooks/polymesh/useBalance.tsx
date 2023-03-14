import { useContext, useEffect, useState } from 'react';
import { UnsubCallback } from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshContext } from '~/context/PolymeshContext';
import useAccounts from './useAccounts';

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

const useBalance = (): IUseBalance => {
  const {
    api: { sdk },
    // accounts: { selectedAccount },
  } = useContext(PolymeshContext);
  const { selectedAccount } = useAccounts();
  const [balance, setBalance] = useState<IParsedBalance>({
    free: '',
    locked: '',
    total: '',
  });
  const [balanceError, setBalanceError] = useState('');
  const [balanceIsLoading, setBalanceIsLoading] = useState(false);

  // Get balance data when accounts are set
  useEffect(() => {
    if (!selectedAccount) return undefined;

    let unsubCb: UnsubCallback | null = null;
    (async () => {
      try {
        setBalanceIsLoading(true);
        unsubCb = await sdk.accountManagement.getAccountBalance(
          {
            account: selectedAccount,
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
  }, [selectedAccount, sdk]);

  return { balance, balanceError, balanceIsLoading };
};

export default useBalance;
