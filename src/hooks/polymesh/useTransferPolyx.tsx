import { useContext, useState, useEffect } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  BalancesTx,
  UnsubCallback,
} from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';
import { useTransactionStatus } from '~/hooks/polymesh';
import { notifyError, notifyWarning } from '~/helpers/notifications';

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
  const [availableBalance, setAvailableBalance] = useState(0);
  const [availableMinusGasFee, setAvailableMinusGasFee] = useState(0);
  const [transactionInProcess, setTransactionInProcess] = useState(false);
  const { handleStatusChange } = useTransactionStatus();

  // Subscribe to the selected account's balance and current gas fees.
  useEffect(() => {
    if (!sdk || !selectedAccount) return undefined;

    let unsubCb: UnsubCallback | null = null;
    (async () => {
      unsubCb = await sdk.accountManagement.getAccountBalance(
        { account: selectedAccount },
        async (balance) => {
          setAvailableBalance(balance.free.toNumber());

          const gasFees = await sdk.network.getProtocolFees({
            tags: [BalancesTx.Transfer, BalancesTx.TransferWithMemo],
          });
          const fee = gasFees[0].fees.toNumber();

          setAvailableMinusGasFee(balance.free.toNumber() - fee * 1.5);
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
    availableMinusGasFee,
    transferPolyx,
    transactionInProcess,
    selectedAccount,
    checkAddressValidity,
  };
};

export default useTransferPolyx;
