import {
  GenericPolymeshTransaction,
  MultiSigProposal,
  TransactionStatus,
} from '@polymeshassociation/polymesh-sdk/types';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';
import { BatchTransactionOptions, TransactionOptions } from './constants';
import TransactionStatusContext from './context';

interface ITransactionStatusProviderProps {
  children: React.ReactNode;
}

const TransactionStatusProvider = ({
  children,
}: ITransactionStatusProviderProps) => {
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const activeTransactionsRef = useRef(0);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { accountIsMultisigSigner } = useContext(AccountContext);
  const { handleStatusChange } = useTransactionStatus();

  const incrementActiveTransactions = useCallback(() => {
    activeTransactionsRef.current += 1;
    if (activeTransactionsRef.current === 1) {
      setIsTransactionInProgress(true);
    }
  }, []);

  const decrementActiveTransactions = useCallback(() => {
    activeTransactionsRef.current = Math.max(
      0,
      activeTransactionsRef.current - 1,
    );
    if (activeTransactionsRef.current === 0) {
      setIsTransactionInProgress(false);
    }
  }, []);

  // Helper to determine if transaction should run as proposal
  const shouldRunAsProposal = useCallback(
    (runAsMultiSigProposal: 'auto' | 'always' | 'never' = 'auto'): boolean => {
      switch (runAsMultiSigProposal) {
        case 'always':
          return true;
        case 'never':
          return false;
        case 'auto':
        default:
          return accountIsMultisigSigner;
      }
    },
    [accountIsMultisigSigner],
  );

  // Helper function to set up middleware handling
  const setupMiddleware = useCallback(
    <ProcedureReturnValue, ReturnValue>(
      transaction: GenericPolymeshTransaction<
        ProcedureReturnValue,
        ReturnValue
      >,
      onProcessedByMiddleware?: () => void | Promise<void>,
    ) => {
      let middlewareUnsubscribe: (() => void) | undefined;
      const middlewarePromise = new Promise<void>((resolve) => {
        if (onProcessedByMiddleware) {
          middlewareUnsubscribe = transaction.onProcessedByMiddleware(
            (error) => {
              if (error) {
                notifyError((error as Error).message);
              } else {
                onProcessedByMiddleware();
              }
              resolve();
            },
          );
        } else {
          resolve();
        }
      });
      return { middlewareUnsubscribe, middlewarePromise };
    },
    [],
  );

  // Generic helper function to set up status change handler for all transaction types
  const setupStatusHandler = useCallback(
    function setupStatusHandlerImpl<ProcedureReturnValue, ReturnValue>(
      transaction: GenericPolymeshTransaction<
        ProcedureReturnValue,
        ReturnValue
      >,
      transactionId: string,
      onSuccess?:
        | ((result: ReturnValue) => void | Promise<void>)
        | (() => void | Promise<void>),
      onError?: (error: Error) => void | Promise<void>,
      onTransactionRunning?: () => void | Promise<void>,
      middlewareCleanup?: {
        middlewareUnsubscribe?: () => void;
        middlewarePromise?: Promise<void>;
      },
      isProposal = false,
    ) {
      let statusHandled = false;

      const unsubscribe = transaction.onStatusChange((txObject) => {
        handleStatusChange(txObject, transactionId);

        switch (txObject.status) {
          case TransactionStatus.Running:
            if (onTransactionRunning) {
              onTransactionRunning();
            }
            break;

          case TransactionStatus.Succeeded:
            if (onSuccess) {
              if (isProposal) {
                // For proposals, don't access txObject.result as it will throw an error
                (onSuccess as () => void | Promise<void>)();
              } else {
                // For regular transactions, pass the result
                (onSuccess as (result: ReturnValue) => void | Promise<void>)(
                  txObject.result,
                );
              }
            }
            statusHandled = true;
            decrementActiveTransactions();
            if (unsubscribe) {
              unsubscribe();
            }
            // Clean up middleware subscription after processing completes
            if (
              middlewareCleanup?.middlewareUnsubscribe &&
              middlewareCleanup?.middlewarePromise
            ) {
              middlewareCleanup.middlewarePromise.then(() => {
                if (middlewareCleanup.middlewareUnsubscribe) {
                  middlewareCleanup.middlewareUnsubscribe();
                }
              });
            }
            break;

          case TransactionStatus.Failed:
          case TransactionStatus.Rejected:
          case TransactionStatus.Aborted:
            if (onError) {
              onError(txObject.error || new Error('Transaction failed'));
            }
            statusHandled = true;
            decrementActiveTransactions();
            if (unsubscribe) {
              unsubscribe();
            }
            if (middlewareCleanup?.middlewareUnsubscribe) {
              middlewareCleanup.middlewareUnsubscribe();
            }
            break;

          default:
            break;
        }
      });

      return { unsubscribe, statusHandled };
    },
    [handleStatusChange, decrementActiveTransactions],
  );

  // Main method for executing transactions
  const executeTransaction = useCallback(
    async function executeTransactionImpl<ProcedureReturnValue, ReturnValue>(
      transactionPromise: Promise<
        GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>
      >,
      options: TransactionOptions<ReturnValue> = {},
    ): Promise<ReturnValue | MultiSigProposal> {
      const {
        onTransactionRunning,
        onProcessedByMiddleware,
        onSuccess,
        onError,
        runAsMultiSigProposal = 'auto',
      } = options;

      if (!sdk) {
        const error = new Error('SDK not available');
        notifyError(error.message);
        if (onError) {
          onError(error);
        }
        // Always decrement since status handler won't be called on exceptions
        decrementActiveTransactions();
        throw error;
      }

      incrementActiveTransactions();

      try {
        const transaction = await transactionPromise;

        // Set up middleware handler
        const { middlewareUnsubscribe, middlewarePromise } = setupMiddleware(
          transaction,
          onProcessedByMiddleware,
        );

        // Determine if we should run as proposal
        const isProposal = shouldRunAsProposal(runAsMultiSigProposal);

        const transactionId = `tx-${Date.now()}-${Math.random()}`;

        setupStatusHandler(
          transaction,
          transactionId,
          onSuccess,
          onError,
          onTransactionRunning,
          { middlewareUnsubscribe, middlewarePromise },
          isProposal,
        );

        // Execute based on context
        if (isProposal) {
          const proposal = await transaction.runAsProposal();
          return proposal;
        }
        const result = await transaction.run();
        return result;
      } catch (error) {
        const err = error as Error;
        notifyError(err.message);
        if (onError) {
          onError(err);
        }
        // Always decrement since status handler won't be called on exceptions
        decrementActiveTransactions();
        throw err;
      }
    },
    [
      sdk,
      setupMiddleware,
      setupStatusHandler,
      incrementActiveTransactions,
      decrementActiveTransactions,
      shouldRunAsProposal,
    ],
  );

  // Method for executing batch transactions
  const executeBatchTransaction = useCallback(
    async function executeBatchTransactionImpl<
      ProcedureReturnValue,
      ReturnValue,
    >(
      transactionPromises: Promise<
        GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>
      >[],
      options: BatchTransactionOptions<ReturnValue> = {},
    ): Promise<ReturnValue[] | MultiSigProposal> {
      const {
        onTransactionRunning,
        onProcessedByMiddleware,
        onSuccess,
        onError,
        nonce,
        runAsMultiSigProposal = 'auto',
      } = options;

      if (!sdk) {
        const error = new Error('SDK not available');
        notifyError(error.message);
        if (onError) {
          onError(error);
        }
        // Always decrement since status handler won't be called on exceptions
        decrementActiveTransactions();
        throw error;
      }

      incrementActiveTransactions();

      try {
        // Resolve all transaction promises
        const transactions = await Promise.all(transactionPromises);

        // Create batch transaction with optional nonce
        const batchTransaction = await sdk.createTransactionBatch(
          {
            transactions,
          },
          nonce ? { nonce } : undefined,
        );

        // Set up middleware handler
        const { middlewareUnsubscribe, middlewarePromise } = setupMiddleware(
          batchTransaction,
          onProcessedByMiddleware,
        );

        // Determine if we should run as proposal
        const isProposal = shouldRunAsProposal(runAsMultiSigProposal);
        const transactionId = `${isProposal ? 'batch-proposal' : 'batch'}-${Date.now()}-${Math.random()}`;

        setupStatusHandler(
          batchTransaction,
          transactionId,
          onSuccess,
          onError,
          onTransactionRunning,
          { middlewareUnsubscribe, middlewarePromise },
          isProposal,
        );

        // Execute based on context
        if (isProposal) {
          const proposal = await batchTransaction.runAsProposal();
          return proposal;
        }
        const results = await batchTransaction.run();
        return results;
      } catch (error) {
        const err = error as Error;
        notifyError(err.message);
        if (onError) {
          onError(err);
        }
        // Always decrement since status handler won't be called on exceptions
        decrementActiveTransactions();
        throw err;
      }
    },
    [
      sdk,
      setupMiddleware,
      setupStatusHandler,
      incrementActiveTransactions,
      decrementActiveTransactions,
      shouldRunAsProposal,
    ],
  );

  const contextValue = useMemo(
    () => ({
      executeTransaction,
      executeBatchTransaction,
      isTransactionInProgress,
    }),
    [executeTransaction, executeBatchTransaction, isTransactionInProgress],
  );

  return (
    <TransactionStatusContext.Provider value={contextValue}>
      {children}
    </TransactionStatusContext.Provider>
  );
};

export default TransactionStatusProvider;
