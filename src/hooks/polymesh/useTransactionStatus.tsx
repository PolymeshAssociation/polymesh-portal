import { useRef } from 'react';
import {
  GenericPolymeshTransaction,
  TransactionStatus,
  TxTag,
} from '@polymeshassociation/polymesh-sdk/types';
import { PolymeshTransactionBatch } from '@polymeshassociation/polymesh-sdk/internal';
import { Id, toast } from 'react-toastify';
import { TransactionToast } from '~/components/NotificationToasts';

const useTransactionStatus = () => {
  const idRef = useRef<Id>(0);

  const handleStatusChange = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: GenericPolymeshTransaction<any, any>,
  ) => {
    let tag: TxTag;

    if (transaction instanceof PolymeshTransactionBatch) {
      tag = transaction.transactions[0].tag;
    } else {
      tag = transaction.tag;
    }
    switch (transaction.status) {
      case TransactionStatus.Unapproved:
        idRef.current = toast.info(
          <TransactionToast
            message="Please sign transaction in your wallet"
            tag={tag}
            status={transaction.status}
            timestamp={Date.now()}
          />,
          {
            autoClose: false,
            closeOnClick: false,
            containerId: 'notification-center',
          },
        );

        break;

      case TransactionStatus.Running:
        toast.update(idRef.current, {
          render: (
            <TransactionToast
              txHash={transaction.txHash}
              status={transaction.status}
              tag={tag}
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
        toast.update(idRef.current, {
          render: (
            <TransactionToast
              txHash={transaction.txHash}
              status={transaction.status}
              tag={tag}
              timestamp={Date.now()}
            />
          ),
          type: toast.TYPE.SUCCESS,
          isLoading: false,
          autoClose: false,
          closeOnClick: false,
          containerId: 'notification-center',
        });
        break;
      case TransactionStatus.Rejected:
        toast.update(idRef.current, {
          render: (
            <TransactionToast
              status={transaction.status}
              tag={tag}
              error="Transaction was rejected"
              timestamp={Date.now()}
            />
          ),
          type: toast.TYPE.WARNING,
          isLoading: false,
          autoClose: false,
          closeOnClick: false,
          containerId: 'notification-center',
        });
        break;

      case TransactionStatus.Failed:
        toast.update(idRef.current, {
          render: (
            <TransactionToast
              txHash={transaction.txHash}
              status={transaction.status}
              tag={tag}
              error={transaction.error?.message}
              timestamp={Date.now()}
            />
          ),
          type: toast.TYPE.ERROR,
          isLoading: false,
          autoClose: false,
          closeOnClick: false,
          containerId: 'notification-center',
        });
        break;

      case TransactionStatus.Aborted:
        toast.update(idRef.current, {
          render: (
            <TransactionToast
              status={transaction.status}
              tag={tag}
              error={transaction.error?.message}
              timestamp={Date.now()}
            />
          ),
          type: toast.TYPE.ERROR,
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
