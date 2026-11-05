import {
  Balance,
  ProposalStatus,
} from '@polymeshassociation/polymesh-sdk/types';
import { TMultiSigArgs } from '~/layouts/MultiSig/types';

export interface IAddress {
  did: string;
}
export interface ITicker {
  ticker: string;
  localId: number;
}
export interface IDividend {
  from: {
    did: string;
    kind: {
      Default: null;
    };
  };
  amount: number;
  currency: {
    id: string;
    ticker: string;
  };
  perShare: number;
  expiresAt: number;
  paymentAt: number;
  reclaimed: boolean;
  remaining: number;
}

export interface ITransferEvent {
  id: string;
  blockId: number;
  extrinsicIdx: number;
  block: {
    datetime: string;
  };
  attributes: {
    value: string | Balance | IAddress | ITicker | IDividend | number;
  }[];
}

export interface IEventBlock {
  blockId: number;
  datetime: string;
}

interface IMovement {
  id: string;
  amount?: string;
  nftIds?: string[];
  assetId: string;
  asset: {
    name: string;
    ticker: string;
  };
  createdEvent: {
    block: IEventBlock;
  };
  fromPortfolioId: string | null;
  fromPortfolio: {
    name: string | null;
  } | null;
  fromAccountId: string | null;
  toPortfolioId: string | null;
  toPortfolio: {
    name: string | null;
  } | null;
  toAccountId: string | null;
}

interface IPortfolioMovements {
  nodes: IMovement[];
  totalCount: number;
}

interface ITransferEvents {
  nodes: ITransferEvent[];
  totalCount: number;
}

export interface IMovementQueryResponse {
  assetTransactions: IPortfolioMovements;
}

export interface ITransferQueryResponse {
  events: ITransferEvents;
}

export interface IAssetTransaction {
  amount: number | null;
  nftIds: string[] | null;
  assetId: string;
  id: string;
  fromPortfolioId: string | null;
  toPortfolioId: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  fromIdentityId: string | null;
  toIdentityId: string | null;
  createdEvent: {
    eventIdx: number;
    extrinsicIdx: number | null;
    block: IEventBlock;
  };
  instructionId: string | null;
  instructionMemo: string;
  asset: {
    name: string;
    ticker: string;
  };
}

export interface IAssetTransactions {
  totalCount: number;
  nodes: IAssetTransaction[];
}

export interface ITransactionsQueryResponse {
  assetTransactions: IAssetTransactions;
}

export interface IDistribution {
  id: string;
  targetId: string;
  distributionId: string;
  amount: string;
  amountAfterTax: string;
  tax: string;
  distribution: {
    amount: string;
    currency: {
      id: string;
      ticker: string;
    };
    expiresAt: string;
    portfolioId: string;
    portfolio: {
      name: string | null;
    };
    assetId: string;
    localId: number;
    paymentAt: string;
    perShare: string;
  };
  createdEvent: {
    eventIdx: number;
    block: IEventBlock;
  };
  nodeId: string;
}

export interface IDistributionsQueryResponse {
  distributionPayments: {
    nodes: IDistribution[];
    totalCount: number;
  };
}

export interface IStakingRewardEvent {
  id: string;
  createdEvent: {
    eventIdx: number;
    block: IEventBlock;
  };
  identityId: string;
  stashId: string;
  amount: string;
  eventId: string;
}

export interface IRewardsQueryResponse {
  stakingEvents: {
    nodes: IStakingRewardEvent[];
    totalCount: number;
  };
}

export enum ERawMultiSigStatus {
  ACTIVE = 'Active',
  SUCCESS = 'Success',
  FAILED = 'Failed',
  REJECTED = 'Rejected',
  DELETED = 'Deleted',
}

export interface IRawMultiSigVote {
  action: 'Approved' | 'Rejected';
  signer: {
    signerValue: string;
  };
}

// The arguments of the `create_proposal` extrinsic, keyed by name
export interface IMultiSigProposalArgs {
  proposal?: {
    args: TMultiSigArgs;
    method: string;
    section: string;
  };
  // milliseconds, as a decimal string
  expiry: string | null;
  autoClose?: boolean;
  multisig: string;
}

export interface IMultiSigProposal {
  updatedBlock: {
    blockId: number;
  };
  approvalCount: number;
  createdBlock: {
    blockId: number;
  };
  creatorAccount: string;
  datetime: string;
  extrinsicIdx: number;
  proposalId: number;
  rejectionCount: number;
  status: ProposalStatus | ERawMultiSigStatus;
  votes: {
    nodes: IRawMultiSigVote[];
  };
}

export interface IRawMultiSigProposal {
  updatedEvent: {
    block: {
      blockId: number;
    };
  };
  approvalCount: number;
  creatorAccountId: string | null;
  proposalId: number;
  rejectionCount: number;
  status: ProposalStatus | ERawMultiSigStatus;
  votes: {
    nodes: IRawMultiSigVote[];
  };
  createdEvent: {
    block: IEventBlock;
    extrinsic: {
      moduleId: string;
      callId: string;
      args: IMultiSigProposalArgs | null;
      extrinsicIdx: number;
    } | null;
  };
}

export interface IProposalQueryResponse {
  multiSigProposals: {
    nodes: IRawMultiSigProposal[];
    totalCount: number;
  };
}
