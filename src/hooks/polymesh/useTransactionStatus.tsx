import { useRef } from 'react';
import {
  GenericPolymeshTransaction,
  PolymeshTransaction,
  TransactionStatus,
} from '@polymeshassociation/polymesh-sdk/types';
import { Id, toast } from 'react-toastify';
import { TransactionToast } from '~/components/NotificationToasts';

const useTransactionStatus = () => {
  const idRef = useRef<Id>(0);

  const handleStatusChange = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: GenericPolymeshTransaction<any, any>,
  ) => {
    switch (transaction.status) {
      case TransactionStatus.Unapproved:
        idRef.current = toast.info(
          <TransactionToast
            message="Please sign transaction in your wallet"
            tag={(transaction as PolymeshTransaction).tag}
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
              tag={(transaction as PolymeshTransaction).tag}
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
              tag={(transaction as PolymeshTransaction).tag}
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
              tag={(transaction as PolymeshTransaction).tag}
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
              tag={(transaction as PolymeshTransaction).tag}
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
              tag={(transaction as PolymeshTransaction).tag}
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
