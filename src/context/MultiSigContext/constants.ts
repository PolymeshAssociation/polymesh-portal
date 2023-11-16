import { MultiSigProposal } from '@polymeshassociation/polymesh-sdk/internal';
import { MultiSigProposalDetails } from '@polymeshassociation/polymesh-sdk/types';

export interface IMultiSigContext {
  activeProposalsIds: number[];
  multiSigAccountKey: string;
  multiSigLoading: boolean;
  pendingProposals: ProposalWithDetails[];
  pendingProposalsLoading: boolean;
  refreshProposals: () => void;
  requiredSignatures: number;
  signers: string[];
  unsignedProposals: number[];
}

export const initialState: IMultiSigContext = {
  activeProposalsIds: [],
  multiSigAccountKey: '',
  multiSigLoading: true,
  pendingProposals: [],
  pendingProposalsLoading: true,
  refreshProposals: () => {},
  requiredSignatures: 0,
  signers: [],
  unsignedProposals: [],
};

export type ProposalWithDetails = MultiSigProposal & MultiSigProposalDetails;
