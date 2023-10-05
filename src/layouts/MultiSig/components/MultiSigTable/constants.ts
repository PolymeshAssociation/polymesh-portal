import { ERawMultiSigStatus } from '~/constants/queries/types';

export interface IIdData {
  extrinsicIdx: number;
  createdBlockId: string;
  proposalId: number;
}

export interface IVotes {
  approvalCount: number;
  rejectionCount: number;
}

export interface IHistoricalMultiSigProposals {
  id: IIdData;
  creatorAccount: string;
  module: string;
  call: string;
  votes: IVotes;
  datetime: string;
  status: ERawMultiSigStatus;
}
