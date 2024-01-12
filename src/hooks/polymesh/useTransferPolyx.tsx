import { useContext, useState, useEffect } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { UnsubCallback } from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';
import { useTransactionStatus } from '~/hooks/polymesh';
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
  const [availableBalance, setAvailableBalance] = useState<BigNumber>(
    new BigNumber(0),
  );
  const [maxTransferablePolyx, setMaxTransferablePolyx] = useState<BigNumber>(
    new BigNumber(0),
  );
  const [maxTransferablePolyxWithMemo, setMaxTransferablePolyxWithMemo] =
    useState<BigNumber>(new BigNumber(0));
  const [transactionInProcess, setTransactionInProcess] = useState(false);
  const { handleStatusChange } = useTransactionStatus();

  // Subscribe to the selected account's balance and max transferable.
  useEffect(() => {
    if (!sdk || !selectedAccount) return undefined;

    let unsubCb: UnsubCallback | null = null;
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
                ? balance.free.minus(transferFee)
                : balance.free;
            return max;
          };

          const [maxTransferable, maxTransferableWithMemo] = await Promise.all([
            getMaxTransferablePolyx(),
            getMaxTransferablePolyx(true),
          ]);

          setMaxTransferablePolyx(maxTransferable);
          setMaxTransferablePolyxWithMemo(maxTransferableWithMemo);
        },
      );
    })();

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
    if (!sdk) return undefined;

    setTransactionInProcess(true);

    let unsubCb: UnsubCallback | null = null;

    try {
      const transferPolyxTx = await sdk.network.transferPolyx({
        amount: new BigNumber(amount),
        to,
        memo,
      });

      unsubCb = transferPolyxTx.onStatusChange(handleStatusChange);

      await transferPolyxTx.run();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setTransactionInProcess(false);
    }

    return () => (unsubCb ? unsubCb() : undefined);
  };

  return {
    availableBalance,
    transferPolyx,
    transactionInProcess,
    selectedAccount,
    checkAddressValidity,
    maxTransferablePolyx,
    maxTransferablePolyxWithMemo,
  };
};

export default useTransferPolyx;
