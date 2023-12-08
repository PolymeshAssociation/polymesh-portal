import { useRef } from 'react';
import { TransactionStatus } from '@polymeshassociation/polymesh-sdk/types';
import { Id, toast } from 'react-toastify';
import { TransactionToast } from '~/components/NotificationToasts';
import { IStakeTransaction } from './constants';

export const useStakeStatusChange = () => {
  const idRef = useRef<Id>(0);

  const handleStakeStatusChange = (transaction: IStakeTransaction) => {
    if (!transaction.status) return;

    const {
      status = '',
      tag = '',
      txHash,
      isTxBatch,
      batchSize,
      error,
    } = transaction;

    switch (status) {
      case TransactionStatus.Unapproved:
        idRef.current = toast.info(
          <TransactionToast
            message="Please sign transaction in your wallet"
            tag={tag}
            isTxBatch={isTxBatch}
            batchSize={batchSize}
            status={status}
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
              txHash={txHash}
              status={status}
              tag={tag}
              isTxBatch={isTxBatch}
              batchSize={batchSize}
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
              txHash={txHash}
              status={status}
              tag={tag}
              isTxBatch={isTxBatch}
              batchSize={batchSize}
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
              txHash={txHash}
              status={status}
              tag={tag}
              isTxBatch={isTxBatch}
              batchSize={batchSize}
              error={error || 'Transaction was rejected'}
              timestamp={Date.now()}
            />
          ),
          type: toast.TYPE.WARNING,
          isLoading: false,
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          containerId: 'notification-center',
        });
        break;

      case TransactionStatus.Failed:
        toast.update(idRef.current, {
          render: (
            <TransactionToast
              txHash={txHash}
              status={status}
              tag={tag}
              isTxBatch={isTxBatch}
              batchSize={batchSize}
              error="Transaction failed"
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

      default:
        break;
    }
  };

  return { handleStakeStatusChange };
};
