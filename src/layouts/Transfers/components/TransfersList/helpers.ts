import {
  GenericPolymeshTransaction,
  Instruction,
} from '@polymeshassociation/polymesh-sdk/types';
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

export const createTransactionChunks = (
  transactions: GenericPolymeshTransaction<Instruction, Instruction>[],
  perChunk: number,
) => {
  const result = transactions.reduce((acc, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!acc[chunkIndex]) {
      acc[chunkIndex] = [];
    }

    acc[chunkIndex].push(item);

    return acc;
  }, [] as GenericPolymeshTransaction<Instruction, Instruction>[][]);

  return result;
};
