import {
  AffirmInstructionParams,
  ExecuteManualInstructionParams,
  Instruction,
  RejectInstructionParams,
  Leg,
  InstructionDetails,
  InstructionAffirmation,
} from '@polymeshassociation/polymesh-sdk/types';

export enum EInstructionTypes {
  PENDING = 'pending',
  AFFIRMED = 'affirmed',
  FAILED = 'failed',
}

export enum EActionTypes {
  AFFIRM = 'affirm',
  REJECT = 'reject',
  EXECUTE = 'execute',
}

export enum ESortOptions {
  NEWEST = 'Newest',
  OLDEST = 'Oldest',
}

export type InstructionAction =
  | {
      method: Instruction['reject'];
      params?: RejectInstructionParams;
    }
  | {
      method: Instruction['affirm'];
      params?: AffirmInstructionParams;
    }
  | {
      method: Instruction['executeManually'];
      params?: ExecuteManualInstructionParams;
    };

export interface InstructionData {
  legs: { leg: Leg; errors: string[] }[];
  details: InstructionDetails;
  affirmations: InstructionAffirmation[];
  affirmationsCount: number;
  counterparties: number;
  latestBlock: number;
}
