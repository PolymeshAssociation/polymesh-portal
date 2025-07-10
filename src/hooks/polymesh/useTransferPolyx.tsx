import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { UnsubCallback } from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useEffect, useState } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { notifyError } from '~/helpers/notifications';

export interface ITransfer {
  amount: string;
  to: string;
  memo: string;
}

const useTransferPolyx = () => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { selectedAccount } = useContext(AccountContext);
  const { executeTransaction, isTransactionInProgress } =
    useTransactionStatusContext();
  const [availableBalance, setAvailableBalance] = useState<BigNumber>(
    new BigNumber(0),
  );
  const [maxTransferablePolyx, setMaxTransferablePolyx] = useState<BigNumber>(
    new BigNumber(0),
  );
  const [maxTransferablePolyxWithMemo, setMaxTransferablePolyxWithMemo] =
    useState<BigNumber>(new BigNumber(0));

  // Subscribe to the selected account's balance and max transferable.
  useEffect(() => {
    if (!sdk || !selectedAccount) return undefined;

    let unsubCb: UnsubCallback | null = null;
    let isMounted = true;

    const setupSubscription = async () => {
      try {
        unsubCb = await sdk.accountManagement.getAccountBalance(
          { account: selectedAccount },
          async (balance) => {
            // Check if component is still mounted and account hasn't changed
            if (!isMounted) {
              if (unsubCb) unsubCb();
              return;
            }

            setAvailableBalance(balance.free);

            const getMaxTransferablePolyx = async (
              withMemo?: boolean,
            ): Promise<BigNumber> => {
              const transferTx = await sdk.network.transferPolyx({
                amount: balance.free,
                to: selectedAccount,
                memo: withMemo ? 'Dummy memo' : undefined,
              });

              const transferFees = await transferTx.getTotalFees();
              const transferFee = transferFees.fees.total;
              const payingAccount =
                transferFees.payingAccountData.account.address;

              // check if the account is subsidised
              const max =
                payingAccount === selectedAccount
                  ? BigNumber.max(
                      balance.free.minus(transferFee),
                      new BigNumber(0),
                    )
                  : balance.free;

              return max;
            };

            try {
              const [maxTransferable, maxTransferableWithMemo] =
                await Promise.all([
                  getMaxTransferablePolyx(),
                  getMaxTransferablePolyx(true),
                ]);

              if (isMounted) {
                setMaxTransferablePolyx(maxTransferable);
                setMaxTransferablePolyxWithMemo(maxTransferableWithMemo);
              }
            } catch (error) {
              if (isMounted) {
                setMaxTransferablePolyx(balance.free);
                setMaxTransferablePolyxWithMemo(balance.free);

                notifyError(
                  'Error estimating transaction fee. The max transferable amount does not account for transaction fees',
                );
              }
            }
          },
        );
      } catch (error) {
        if (isMounted) {
          notifyError((error as Error).message);
        }
      }
    };

    setupSubscription();

    return () => {
      isMounted = false;
      if (unsubCb) {
        unsubCb();
      }
    };
  }, [sdk, selectedAccount, isTransactionInProgress]);

  const checkAddressValidity = (address: string) => {
    if (!sdk) return false;

    try {
      const isValid = sdk.accountManagement.isValidAddress({ address });
      return isValid;
    } catch (error) {
      return false;
    }
  };

  // Emit transaction
  const transferPolyx: (options: ITransfer) => void = async ({
    amount,
    to,
    memo,
  }) => {
    if (!sdk) {
      notifyError('SDK not available');
      return;
    }

    try {
      await executeTransaction(
        sdk.network.transferPolyx({
          amount: new BigNumber(amount),
          to,
          memo,
        }),
        {
          onTransactionRunning: () => {
            // Optional: Handle transaction running state
          },
          onSuccess: () => {
            // Optional: Handle success
          },
          onError: (/* error: Error */) => {
            // Optional: Handle error
          },
        },
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  return {
    availableBalance,
    transferPolyx,
    transactionInProcess: isTransactionInProgress,
    selectedAccount,
    checkAddressValidity,
    maxTransferablePolyx,
    maxTransferablePolyxWithMemo,
  };
};

export default useTransferPolyx;
