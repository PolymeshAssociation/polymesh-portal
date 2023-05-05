import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  Identity,
  InstructionAffirmation,
} from '@polymeshassociation/polymesh-sdk/types';

export const isLastManualAffirmation = ({
  instructionAffirmations,
  counterparties,
  identity,
}: {
  instructionAffirmations: InstructionAffirmation[];
  counterparties: number;
  identity: Identity | null;
}) => {
  if (!identity) return false;

  if (
    instructionAffirmations.length === counterparties - 1 &&
    !instructionAffirmations.find(
      (affirmation) => affirmation.identity.did === identity.did,
    )
  ) {
    return true;
  }

  return false;
};

export const getLatestBlockNumber = async (sdk: Polymesh | null) => {
  if (!sdk) return 0;
  const latestBlock = await sdk.network.getLatestBlock();
  return latestBlock.toNumber();
};
