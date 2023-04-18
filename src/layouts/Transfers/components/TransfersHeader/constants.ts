export enum EInstructionTypes {
  PENDING = 'pending',
  AFFIRMED = 'affirmed',
  FAILED = 'failed',
}

export const TABS = [
  {
    label: EInstructionTypes.PENDING,
    searchParam: { type: EInstructionTypes.PENDING },
  },
  {
    label: EInstructionTypes.AFFIRMED,
    searchParam: { type: EInstructionTypes.AFFIRMED },
  },
  {
    label: EInstructionTypes.FAILED,
    searchParam: { type: EInstructionTypes.FAILED },
  },
];
