import { IRawMultiSigProposal } from '~/constants/queries/types';

export interface IMultiSigContext {
  accountKey: string;
  pendingProposals: IRawMultiSigProposal[];
  pendingProposalsLoading: boolean;
  refreshProposals: () => void;
  requiredSignatures: number;
  signers: string[];
  unsignedProposals: number[];
}

export const initialState: IMultiSigContext = {
  accountKey: '',
  pendingProposals: [],
  pendingProposalsLoading: true,
  refreshProposals: () => {},
  requiredSignatures: 0,
  signers: [],
  unsignedProposals: [],
};
