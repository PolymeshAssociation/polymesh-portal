import { Instruction } from '@polymeshassociation/polymesh-sdk/types';

export interface IInstructionsContext {
  pendingInstructions: Instruction[];
  instructionsLoading: boolean;
}

export const initialState = {
  pendingInstructions: [],
  instructionsLoading: false,
};
