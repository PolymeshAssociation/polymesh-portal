import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  GenericPolymeshTransaction,
  MultiSigProposal,
} from '@polymeshassociation/polymesh-sdk/types';

// Shared transaction option types
export interface BaseTransactionOptions {
  onTransactionRunning?: () => void | Promise<void>;
  onProcessedByMiddleware?: () => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
  /**
   * Controls whether the transaction should be submitted as a multisig proposal
   * - 'auto': Automatically run as proposal if the signing key is a multisig signer (default)
   * - 'always': Always run as a multisig proposal
   * - 'never': Never run as a multisig proposal, always use regular .run()
   */
  runAsMultiSigProposal?: 'auto' | 'always' | 'never';
}

export interface TransactionOptions<T> extends BaseTransactionOptions {
  onSuccess?: (result: T | MultiSigProposal) => void | Promise<void>;
}

export interface BatchTransactionOptions<T> extends BaseTransactionOptions {
  onSuccess?: (results: T[] | MultiSigProposal) => void | Promise<void>;
  nonce?: () => BigNumber | BigNumber;
}

/**
 * Transaction Status Context Interface
 *
 * This interface follows the Polymesh SDK's generic pattern where:
 * - ReturnValue: The raw return value from the blockchain operation (internal to SDK)
 * - TransformedReturnValue: The processed, user-facing result returned by transaction.run()
 *
 * Users should work with the TransformedReturnValue, which is what gets returned from
 * transaction.run() and transaction.result. This is the SDK-facing, developer-friendly result.
 */
export interface ITransactionStatusContext {
  executeTransaction: <ReturnValue, TransformedReturnValue>(
    transactionPromise: Promise<
      GenericPolymeshTransaction<ReturnValue, TransformedReturnValue>
    >,
    options?: TransactionOptions<TransformedReturnValue>,
  ) => Promise<TransformedReturnValue | MultiSigProposal>;

  executeBatchTransaction: <ReturnValue, TransformedReturnValue>(
    transactionPromises: Promise<
      GenericPolymeshTransaction<ReturnValue, TransformedReturnValue>
    >[],
    options?: BatchTransactionOptions<TransformedReturnValue>,
  ) => Promise<TransformedReturnValue[] | MultiSigProposal>;

  isTransactionInProgress: boolean;
}

export const initialState: ITransactionStatusContext = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  executeTransaction: <ReturnValue, TransformedReturnValue>() =>
    Promise.resolve({} as TransformedReturnValue),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  executeBatchTransaction: <ReturnValue, TransformedReturnValue>() =>
    Promise.resolve([] as TransformedReturnValue[]),
  isTransactionInProgress: false,
};
