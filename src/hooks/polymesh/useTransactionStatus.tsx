import { useRef } from 'react';
import { PolymeshTransaction } from '@polymeshassociation/polymesh-sdk/types';
import { toast } from 'react-toastify';

const useTransactionStatus = () => {
  const idRef = useRef();

  const handleStatusChange = (transaction: PolymeshTransaction) => {
    switch (transaction.status) {
      case 'Unapproved':
        idRef.current = toast.info('Please sign transaction in your wallet', {
          autoClose: false,
        });

        break;

      case 'Running':
        toast.update(idRef.current, {
          render: (
            <div>
              <p>{transaction.tag}</p>
              <p>{transaction.status}</p>
            </div>
          ),
          isLoading: true,
          autoClose: false,
          closeOnClick: false,
          closeButton: true,
        });
        break;
      case 'Succeeded':
        toast.update(idRef.current, {
          render: (
            <>
              <p>{transaction.tag}</p>
              <p>{transaction.status}</p>
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
        toast.update(idRef.current, {
          render: (
            <div>
              <p>{transaction.tag}</p>
              <p>{transaction.status}</p>
            </div>
          ),
          type: toast.TYPE.WARNING,
          isLoading: false,
          autoClose: false,
          closeOnClick: false,
          closeButton: true,
        });
        break;

      case 'Failed':
        toast.update(idRef.current, {
          render: (
            <>
              <p>{transaction.tag}</p>
              <p>{transaction.error}</p>
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
        toast.update(idRef.current, {
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

  return { handleStatusChange };
};

export default useTransactionStatus;
