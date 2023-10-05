import { Instruction } from '@polymeshassociation/polymesh-sdk/types';

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
  | Instruction['reject']
  | Instruction['affirm']
  | Instruction['executeManually'];
