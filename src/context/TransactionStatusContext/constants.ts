import {
  GenericPolymeshTransaction,
  MultiSigProposal,
} from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';

// Shared transaction option types
export interface BaseTransactionOptions {
  onTransactionRunning?: () => void | Promise<void>;
  onProcessedByMiddleware?: () => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
}

export interface TransactionOptions<T> extends BaseTransactionOptions {
  onSuccess?: (result: T) => void | Promise<void>;
}

export interface ProposalOptions extends BaseTransactionOptions {
  onSuccess?: () => void | Promise<void>;
}

export interface BatchTransactionOptions<T> extends BaseTransactionOptions {
  onSuccess?: (results: T[]) => void | Promise<void>;
  nonce?: () => BigNumber | BigNumber;
}

export interface BatchProposalOptions extends BaseTransactionOptions {
  onSuccess?: () => void | Promise<void>;
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
  ) => Promise<TransformedReturnValue>;

  executeBatchTransaction: <ReturnValue, TransformedReturnValue>(
    transactionPromises: Promise<
      GenericPolymeshTransaction<ReturnValue, TransformedReturnValue>
    >[],
    options?: BatchTransactionOptions<TransformedReturnValue>,
  ) => Promise<TransformedReturnValue[]>;

  executeAsProposal: <ReturnValue, TransformedReturnValue>(
    transactionPromise: Promise<
      GenericPolymeshTransaction<ReturnValue, TransformedReturnValue>
    >,
    options?: ProposalOptions,
  ) => Promise<MultiSigProposal>;

  executeBatchAsProposal: <ReturnValue, TransformedReturnValue>(
    transactionPromises: Promise<
      GenericPolymeshTransaction<ReturnValue, TransformedReturnValue>
    >[],
    options?: BatchProposalOptions,
  ) => Promise<MultiSigProposal>;

  isTransactionInProgress: boolean;
}

export const initialState: ITransactionStatusContext = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  executeTransaction: <ReturnValue, TransformedReturnValue>() =>
    Promise.resolve({} as TransformedReturnValue),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  executeBatchTransaction: <ReturnValue, TransformedReturnValue>() =>
    Promise.resolve([] as TransformedReturnValue[]),
  executeAsProposal: () => Promise.resolve({} as MultiSigProposal),
  executeBatchAsProposal: () => Promise.resolve({} as MultiSigProposal),
  isTransactionInProgress: false,
};
