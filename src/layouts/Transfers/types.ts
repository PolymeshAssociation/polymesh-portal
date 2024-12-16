import {
  AffirmInstructionParams,
  ExecuteManualInstructionParams,
  Instruction,
  RejectInstructionParams,
  WithdrawInstructionParams,
  Leg,
  InstructionDetails,
  InstructionAffirmation,
  MediatorAffirmation,
} from '@polymeshassociation/polymesh-sdk/types';

export enum EInstructionTypes {
  PENDING = 'pending',
  AFFIRMED = 'affirmed',
  FAILED = 'failed',
}

export enum EActionTypes {
  AFFIRM = 'affirm',
  REJECT = 'reject',
  WITHDRAW = 'withdraw',
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
    }
  | {
      method: Instruction['withdraw'];
      params?: WithdrawInstructionParams;
    };

export interface InstructionData {
  legs: { leg: Leg; errors: string[] }[];
  details: InstructionDetails;
  affirmations: InstructionAffirmation[];
  affirmationsCount: number;
  counterparties: number;
  latestBlock: number;
  mediators: MediatorAffirmation[];
}
