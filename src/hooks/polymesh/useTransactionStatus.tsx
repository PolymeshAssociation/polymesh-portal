import { useRef } from 'react';
import {
  PolymeshTransaction,
  TransactionStatus,
} from '@polymeshassociation/polymesh-sdk/types';
import { toast } from 'react-toastify';
import { TransactionToast } from '~/components/NotificationToasts';

const useTransactionStatus = () => {
  const idRef = useRef();

  const handleStatusChange = (transaction: PolymeshTransaction) => {
    switch (transaction.status) {
      case TransactionStatus.Unapproved:
        idRef.current = toast.info(
          <TransactionToast
            message="Please sign transaction in your wallet"
            tag={transaction.tag}
            timestamp={Date.now()}
          />,
          {
            autoClose: false,
            closeOnClick: false,
          },
        );

        break;

      case TransactionStatus.Running:
        toast.update(idRef.current, {
          render: (
            <TransactionToast
              txHash={transaction.txHash}
              status={transaction.status}
              tag={transaction.tag}
              timestamp={Date.now()}
            />
          ),
          isLoading: true,
          autoClose: false,
          closeOnClick: false,
        });
        break;
      case TransactionStatus.Succeeded:
        toast.update(idRef.current, {
          render: (
            <TransactionToast
              txHash={transaction.txHash}
              status={transaction.status}
              tag={transaction.tag}
              timestamp={Date.now()}
            />
          ),
          type: toast.TYPE.SUCCESS,
          isLoading: false,
          autoClose: false,
          closeOnClick: false,
        });
        break;
      case TransactionStatus.Rejected:
        toast.update(idRef.current, {
          render: (
            <TransactionToast
              status={transaction.status}
              tag={transaction.tag}
              error="Transaction was rejected"
              timestamp={Date.now()}
            />
          ),
          type: toast.TYPE.WARNING,
          isLoading: false,
          autoClose: false,
          closeOnClick: false,
        });
        break;

      case TransactionStatus.Failed:
        toast.update(idRef.current, {
          render: (
            <TransactionToast
              txHash={transaction.txHash}
              status={transaction.status}
              tag={transaction.tag}
              error={transaction.error?.message}
              timestamp={Date.now()}
            />
          ),
          type: toast.TYPE.ERROR,
          isLoading: false,
          autoClose: false,
          closeOnClick: false,
        });
        break;

      case TransactionStatus.Aborted:
        toast.update(idRef.current, {
          render: (
            <TransactionToast
              status={transaction.status}
              tag={transaction.tag}
              error={transaction.error?.message}
              timestamp={Date.now()}
            />
          ),
          type: toast.TYPE.ERROR,
          isLoading: false,
          autoClose: false,
          closeOnClick: true,
        });
        break;

      default:
        break;
    }
  };

  return { handleStatusChange };
};

export default useTransactionStatus;
