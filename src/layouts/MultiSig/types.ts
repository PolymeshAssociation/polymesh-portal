import { IRawMultiSigProposal } from '~/constants/queries/types';

export enum EMultiSigTypes {
  PENDING = 'pending',
  HISTORICAL = 'historical',
  NOT_MULTISIG = 'not-multisig',
}

export enum ESortOptions {
  NEWEST = 'Newest',
  OLDEST = 'Oldest',
}

export enum EProposalAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export type TMultiSigCall = Record<string, string | number | null>;
export type TMultiSigCalls = Record<string, TMultiSigCall>;

export type TMultiSigCallArgs = {
  callIndex: string;
  args: TMultiSigCall;
};

export type TMultiSigArgs = Record<string, TMultiSigCall | TMultiSigCallArgs[]>;

export type TMultiSigArgsFormatted = {
  index: string;
  module: string;
  call: string;
  args: TMultiSigCalls;
};

export interface IMultiSigListItem extends IRawMultiSigProposal {
  args: TMultiSigArgs;
  call: string;
  callIndex?: string;
  expiry: Date | null;
  module: string;
}
