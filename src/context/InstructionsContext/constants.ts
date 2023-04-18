import {
  GroupedInstructions,
  Instruction,
  Venue,
} from '@polymeshassociation/polymesh-sdk/types';

export interface IInstructionsContext {
  allInstructions: GroupedInstructions | null;
  pendingInstructions: Instruction[];
  createdVenues: Venue[];
  instructionsLoading: boolean;
  refreshInstructions: () => void;
}

export const initialState = {
  allInstructions: null,
  pendingInstructions: [],
  createdVenues: [],
  instructionsLoading: false,
  refreshInstructions: () => {},
};
