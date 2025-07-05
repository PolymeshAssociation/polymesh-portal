import {
  GenericPolymeshTransaction,
  TransactionStatus,
  TxTag,
} from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshTransactionBatch } from '@polymeshassociation/polymesh-sdk/internal';
import { Id, toast } from 'react-toastify';
import { TransactionToast } from '~/components/NotificationToasts';

const useTransactionStatus = () => {
  const handleStatusChange = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: GenericPolymeshTransaction<any, any>,
    transactionId: Id,
  ) => {
    const isTxBatch = transaction instanceof PolymeshTransactionBatch;
    let tag: TxTag;

    if (isTxBatch) {
      tag = transaction.transactions[0].tag;
    } else {
      tag = transaction.tag;
    }

    const toastId = transactionId;

    switch (transaction.status) {
      case TransactionStatus.Unapproved: {
        toast.info(
          <TransactionToast
            message="Please sign transaction in your wallet"
            tag={tag}
            isTxBatch={isTxBatch}
            batchSize={isTxBatch ? transaction.transactions.length : 0}
            status={transaction.status}
            timestamp={Date.now()}
          />,
          {
            autoClose: false,
            closeOnClick: false,
            containerId: 'notification-center',
            toastId,
          },
        );

        break;
      }

      case TransactionStatus.Running:
        toast.update(toastId, {
          render: (
            <TransactionToast
              txHash={transaction.txHash}
              status={transaction.status}
              tag={tag}
              isTxBatch={isTxBatch}
              batchSize={isTxBatch ? transaction.transactions.length : 0}
              timestamp={Date.now()}
            />
          ),
          isLoading: true,
          autoClose: false,
          closeOnClick: false,
          containerId: 'notification-center',
        });
        break;
      case TransactionStatus.Succeeded:
        toast.update(toastId, {
          render: (
            <TransactionToast
              txHash={transaction.txHash}
              status={transaction.status}
              tag={tag}
              isTxBatch={isTxBatch}
              batchSize={isTxBatch ? transaction.transactions.length : 0}
              timestamp={Date.now()}
            />
          ),
          type: 'success',
          isLoading: false,
          autoClose: false,
          closeOnClick: false,
          containerId: 'notification-center',
        });
        break;
      case TransactionStatus.Rejected:
        toast.update(toastId, {
          render: (
            <TransactionToast
              status={transaction.status}
              tag={tag}
              isTxBatch={isTxBatch}
              batchSize={isTxBatch ? transaction.transactions.length : 0}
              error={transaction.error?.message || 'Transaction was rejected'}
              timestamp={Date.now()}
            />
          ),
          type: 'warning',
          isLoading: false,
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          containerId: 'notification-center',
        });
        break;

      case TransactionStatus.Failed:
        toast.update(toastId, {
          render: (
            <TransactionToast
              txHash={transaction.txHash}
              status={transaction.status}
              tag={tag}
              isTxBatch={isTxBatch}
              batchSize={isTxBatch ? transaction.transactions.length : 0}
              error={transaction.error?.message}
              timestamp={Date.now()}
            />
          ),
          type: 'error',
          isLoading: false,
          autoClose: false,
          closeOnClick: false,
          containerId: 'notification-center',
        });
        break;

      case TransactionStatus.Aborted:
        toast.update(toastId, {
          render: (
            <TransactionToast
              status={transaction.status}
              tag={tag}
              isTxBatch={isTxBatch}
              batchSize={isTxBatch ? transaction.transactions.length : 0}
              error={transaction.error?.message}
              timestamp={Date.now()}
            />
          ),
          type: 'error',
          isLoading: false,
          autoClose: false,
          closeOnClick: true,
          containerId: 'notification-center',
        });
        break;

      default:
        break;
    }
  };

  return { handleStatusChange };
};

export default useTransactionStatus;
