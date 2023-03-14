import { useContext, useState, useEffect } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { PolymeshTransactionBase } from '@polymeshassociation/polymesh-sdk/internal';
import { UnsubCallback } from '@polymeshassociation/polymesh-sdk/types';
import { toast, Id } from 'react-toastify';
import { PolymeshContext } from '~/context/PolymeshContext';

interface ITransfer {
  amount: string;
  to: string;
  memo: string;
}
let toastId: Id;

const handleStatusChange = (transaction: PolymeshTransactionBase) => {
  switch (transaction.status) {
    case 'Unapproved':
      toastId = toast.info('Please sign transaction in your wallet', {
        autoClose: false,
      });
      break;

    case 'Running':
      toast.update(toastId, {
        render: 'Transaction in progress',
        isLoading: true,
        autoClose: false,
        closeOnClick: false,
        closeButton: true,
      });
      break;
    case 'Succeeded':
      toast.update(toastId, {
        render: (
          <>
            Transaction successful,{' '}
            <a
              href={`${import.meta.env.VITE_SUBSCAN_URL}extrinsic/${
                transaction?.txHash
              }`}
              target="_blank"
              rel="noopener noreferrer"
            >
              see details
            </a>
          </>
        ),
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        autoClose: false,
        closeOnClick: false,
        closeButton: true,
      });
      break;
    case 'Rejected':
      toast.update(toastId, {
        render: 'The transaction was rejected',
        type: toast.TYPE.WARNING,
        isLoading: false,
        autoClose: false,
        closeOnClick: false,
        closeButton: true,
      });
      break;

    case 'Failed':
      toast.update(toastId, {
        render: (
          <>
            Transaction Failed,{' '}
            <a
              href={`${import.meta.env.VITE_SUBSCAN_URL}extrinsic/${
                transaction?.txHash
              }`}
              target="_blank"
              rel="noopener noreferrer"
            >
              see details
            </a>
          </>
        ),
        type: toast.TYPE.ERROR,
        isLoading: false,
        autoClose: false,
        closeOnClick: false,
        closeButton: true,
      });
      break;

    case 'Aborted':
      toast.update(toastId, {
        render: "Transaction Aborted, the transaction couldn't be broadcast",
        type: toast.TYPE.ERROR,
        isLoading: false,
        autoClose: false,
        closeOnClick: true,
        closeButton: true,
      });
      break;

    default:
      break;
  }
};

const useTransferPolyx = () => {
  const {
    state: { selectedAccount },
    api: { sdk },
  } = useContext(PolymeshContext);
  const [availableBalance, setAvailableBalance] = useState('');
  const [transactionError, setTransactionError] = useState('');
  const [transactionInProcess, setTransactionInProcess] = useState(false);

  // Subscribe to the selected account's balance.
  useEffect(() => {
    if (!sdk || !selectedAccount) return undefined;

    let unsubCb: UnsubCallback | null = null;
    (async () => {
      unsubCb = await sdk.accountManagement.getAccountBalance(
        { account: selectedAccount },
        (balance) => {
          setAvailableBalance(balance.free.toString());
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
    setTransactionError('');

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
      setTransactionError(error.message);
    } finally {
      setTransactionInProcess(false);
    }

    return () => (unsubCb ? unsubCb() : undefined);
  };

  return {
    availableBalance,
    transferPolyx,
    transactionError,
    transactionInProcess,
  };
};

export default useTransferPolyx;
