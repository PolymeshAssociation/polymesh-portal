import {
  GenericPolymeshTransaction,
  Instruction,
} from '@polymeshassociation/polymesh-sdk/types';
import { EActionTypes } from '../../types';

export const createTransactions = (
  action: `${EActionTypes}`,
  selectedItems: Instruction[],
): Promise<GenericPolymeshTransaction<Instruction, Instruction>>[] | null => {
  switch (action) {
    case EActionTypes.AFFIRM:
      return selectedItems.map((instruction) => instruction.affirm());

    case EActionTypes.REJECT:
      return selectedItems.map((instruction) => instruction.reject());

    case EActionTypes.WITHDRAW:
      return selectedItems.map((instruction) => instruction.withdraw());

    case EActionTypes.EXECUTE:
      return selectedItems.map((instruction) => instruction.executeManually());

    default:
      return null;
  }
};

export const createTransactionChunks = (
  transactions: Promise<GenericPolymeshTransaction<Instruction, Instruction>>[],
  perChunk: number,
) => {
  const result = transactions.reduce(
    (acc, item, index) => {
      const chunkIndex = Math.floor(index / perChunk);

      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }

      acc[chunkIndex].push(item);

      return acc;
    },
    [] as Promise<GenericPolymeshTransaction<Instruction, Instruction>>[][],
  );

  return result;
};
