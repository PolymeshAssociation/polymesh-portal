import { useContext, useState, useEffect } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { UnsubCallback } from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';

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
    try {
      (async () => {
        unsubCb = await sdk.accountManagement.getAccountBalance(
          { account: selectedAccount },
          async (balance) => {
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

              setMaxTransferablePolyx(maxTransferable);
              setMaxTransferablePolyxWithMemo(maxTransferableWithMemo);
            } catch (error) {
              setMaxTransferablePolyx(balance.free);
              setMaxTransferablePolyxWithMemo(balance.free);
              notifyError(
                'Error estimating transaction fee. The max transferable amount does not account for transaction fees',
              );
            }
          },
        );
      })();
    } catch (error) {
      notifyError((error as Error).message);
    }

    return () => (unsubCb ? unsubCb() : undefined);
  }, [sdk, selectedAccount]);

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
