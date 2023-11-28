import { Balance } from '@polymeshassociation/polymesh-sdk/types';
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
  currency: string;
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
  amount: string;
  assetId: string;
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

export interface IDistribution {
  targetId: string;
  distributionId: string;
  amount: string;
  amountAfterTax: string;
  tax: string;
  distribution: {
    amount: string;
    currency: string;
    portfolioId: string;
    portfolio: {
      name: string | null;
    };
    assetId: string;
    localId: number;
    perShare: string;
  };
  createdAt: string;
  createdBlockId: string;
  datetime: string;
  eventId: string;
  id: string;
  nodeId: string;
  updatedAt: string;
  updatedBlockId: string;
}

export interface IDistributionsQueryResponse {
  distributionPayments: {
    nodes: IDistribution[];
    totalCount: number;
  };
}

export interface IStakingRewardEvent {
  id: string;
  blockId: number;
  block: {
    datetime: string;
  };
  eventArg0: string;
  eventArg1: string;
  eventArg2: string;
  eventId: string;
  moduleId: string;
}

export interface IRewardsQueryResponse {
  events: {
    nodes: IStakingRewardEvent[];
    totalCount: number;
  };
}

export enum ERawMultiSigStatus {
  ACTIVE = 'Active',
  SUCCESS = 'Success',
  FAILED = 'Failed',
  REJECTED = 'Rejected',
  DELETED = 'Deleted'
}

export interface IRawMultiSigVote {
  action: 'Approved' | 'Rejected';
  signer: {
    signerValue: string;
  };
}
export interface IRawMultiSigProposal {
  updatedBlockId: string;
  approvalCount: number;
  createdBlockId: string;
  creatorAccount: string;
  datetime: string;
  extrinsicIdx: number;
  proposalId: number;
  rejectionCount: number;
  status: ERawMultiSigStatus;
  votes: {
    nodes: IRawMultiSigVote[];
  };
}

export interface IProposalQueryResponse {
  multiSigProposals: {
    nodes: IRawMultiSigProposal[];
    totalCount: number;
  };
}

export interface IRawMultiSigExtrinsic {
  blockId: string;
  extrinsicIdx: number;
  params: [
    {
      name: 'multisig';
      value: string;
    },
    {
      name: 'proposal';
      value: {
        call_args: TMultiSigArgs;
        call_index: string;
        call_module: string;
        call_function: string;
      };
    },
    {
      name: 'expiry';
      value: number | null;
    },
    {
      name: 'auto_close';
      value: boolean;
    },
  ];
}

export interface IMultisigExtrinsicQueryResponse {
  extrinsics: {
    nodes: IRawMultiSigExtrinsic[];
    totalCount: number;
  };
}
