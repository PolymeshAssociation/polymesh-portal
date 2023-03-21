import { useContext, useState, useEffect } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { UnsubCallback } from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatus } from '~/hooks/polymesh';
import { notifyError, notifyWarning } from '~/helpers/notifications';

interface ITransfer {
  amount: string;
  to: string;
  memo: string;
}

const useTransferPolyx = () => {
  const {
    state: { selectedAccount },
    api: { sdk },
  } = useContext(PolymeshContext);
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
            tags: ['balances'],
          });
          const fee = gasFees[0].fees.toNumber();

          setAvailableMinusGasFee(balance.free - fee * 1.5);
        },
      );
    })();

    return () => (unsubCb ? unsubCb() : undefined);
  }, [sdk, selectedAccount]);

  // Emit transaction
  const transferPolyx: (options: ITransfer) => void = async ({
    amount,
    to,
    memo,
  }) => {
    setTransactionInProcess(true);

    // Check permissions
    const isAuthorized = await sdk.network.transferPolyx.checkAuthorization({
      amount,
      to,
      memo,
    });
    if (!isAuthorized) {
      return notifyWarning(
        "Selected key doesn't have permission to sign the transaction",
      );
    }

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
      notifyError(error.message);
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
  };
};

export default useTransferPolyx;
