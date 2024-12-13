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

interface IMovement {
  id: string;
  amount?: string;
  nftIds?: string[];
  assetId: string;
  asset: {
    name: string;
    ticker: string;
  };
  createdBlock: {
    blockId: number;
    datetime: string;
  };
  from: {
    name: string | null;
  };
  to: {
    name: string | null;
  };
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
  portfolioMovements: IPortfolioMovements;
}

export interface ITransferQueryResponse {
  events: ITransferEvents;
}

export interface IAssetTransaction {
  amount: number | null;
  nftIds: string[] | null;
  assetId: string;
  id: string;
  datetime: string;
  fromPortfolioId: string;
  toPortfolioId: string;
  createdBlock: {
    blockId: number;
  };
  extrinsicIdx: number | null;
  eventIdx: number;
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
  createdBlock: {
    blockId: number;
    datetime: string;
  };
  eventId: string;
  nodeId: string;
  updatedBlock: {
    blockId: number;
    datetime: string;
  };
}

export interface IDistributionsQueryResponse {
  distributionPayments: {
    nodes: IDistribution[];
    totalCount: number;
  };
}

export interface IStakingRewardEvent {
  id: string;
  createdEvent?: {
    eventIdx: number;
  };
  createdBlock: {
    blockId: number;
  };
  datetime: string;
  identityId: string;
  stashAccount: string;
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

export interface IMultiSigProposalParams {
  proposal: {
    args: TMultiSigArgs;
    method: string;
    section: string;
  };
  expiry: number | null;
  auto_close: boolean;
  multisig: string;
}

export interface IRawMultiSigProposal {
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
  createdEvent?: {
    extrinsic: {
      params: IMultiSigProposalParams;
      extrinsicIdx: number;
    };
  };
}

export interface IProposalQueryResponse {
  multiSigProposals: {
    nodes: IRawMultiSigProposal[];
    totalCount: number;
  };
}

export interface IRawMultiSigExtrinsic {
  block: {
    blockId: number;
  };
  extrinsicIdx: number;
  params: IMultiSigProposalParams;
}

export interface IMultisigExtrinsicQueryResponse {
  extrinsics: {
    nodes: IRawMultiSigExtrinsic[];
    totalCount: number;
  };
}
