import { Instruction } from '@polymeshassociation/polymesh-sdk/types';
import { EActionTypes } from '../../types';

export const createTransactions = async (
  action: `${EActionTypes}`,
  selectedItems: Instruction[],
) => {
  switch (action) {
    case EActionTypes.AFFIRM:
      return Promise.all(
        selectedItems.map(async (instruction) => instruction.affirm()),
      );

    case EActionTypes.REJECT:
      return Promise.all(
        selectedItems.map(async (instruction) => instruction.reject()),
      );

    case EActionTypes.WITHDRAW:
      return Promise.all(
        selectedItems.map(async (instruction) => instruction.withdraw()),
      );

    case EActionTypes.RESCHEDULE:
      return Promise.all(
        selectedItems.map(async (instruction) => instruction.reschedule()),
      );

    default:
      return null;
  }
};
