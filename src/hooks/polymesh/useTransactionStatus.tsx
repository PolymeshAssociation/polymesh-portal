import { PolymeshTransactionBatch } from '@polymeshassociation/polymesh-sdk/internal';
import {
  GenericPolymeshTransaction,
  TransactionStatus,
  TxTag,
} from '@polymeshassociation/polymesh-sdk/types';
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

    // Set only when an Ethereum wallet broadcast the transaction itself, in which case `txHash` is
    // that Ethereum hash rather than the Substrate extrinsic hash.
    const isEthTxHash = !!transaction.ethTxHash;

    /*
     * The block explorer identifies an extrinsic either by its hash or by `blockNumber-txIndex`.
     * The native path has the hash. The Ethereum path does not — the wallet broadcasts, so the only
     * hash we ever hold is the Ethereum one, and the `revive.ethTransact` extrinsic carrying the
     * call is unsigned, so its hash is never surfaced. What we do get is where it landed: the SDK
     * correlates the Ethereum hash back to that extrinsic and reports the block and index, which
     * addresses the same extrinsic.
     */
    const getExplorerExtrinsicId = (): string | undefined => {
      if (!isEthTxHash) return transaction.txHash;

      const { blockNumber, txIndex } = transaction;
      /*
       * Known from `InBlock` onwards, i.e. once the block scan has located the extrinsic — including
       * on failure, since the SDK records where the transaction landed before it raises the error.
       *
       * A failed transaction is linked like any other. The explorer will show the extrinsic itself
       * as successful, because the outer `revive.ethTransact` emits `ExtrinsicSuccess` even when the
       * inner dispatch reverted and the indexer records that verbatim — but its event list carries
       * the `revive.EthExtrinsicRevert` that says what actually happened, which is exactly what
       * someone following the link from a failed toast is looking for.
       */
      if (blockNumber === undefined || txIndex === undefined) return undefined;

      return `${blockNumber.toString()}-${txIndex.toString()}`;
    };

    const explorerExtrinsicId = getExplorerExtrinsicId();

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
              isEthTxHash={isEthTxHash}
              explorerExtrinsicId={explorerExtrinsicId}
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

      case TransactionStatus.InBlock:
        toast.update(toastId, {
          render: (
            <TransactionToast
              txHash={transaction.txHash}
              isEthTxHash={isEthTxHash}
              explorerExtrinsicId={explorerExtrinsicId}
              status={transaction.status}
              tag={tag}
              isTxBatch={isTxBatch}
              batchSize={isTxBatch ? transaction.transactions.length : 0}
              timestamp={Date.now()}
            />
          ),
          type: 'info',
          isLoading: false,
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
              isEthTxHash={isEthTxHash}
              explorerExtrinsicId={explorerExtrinsicId}
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
              isEthTxHash={isEthTxHash}
              explorerExtrinsicId={explorerExtrinsicId}
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
