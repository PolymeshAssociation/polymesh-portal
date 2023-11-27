import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  Identity,
  InstructionAffirmation,
  InstructionDetails,
  Leg,
  FungibleAsset,
  NftCollection,
  TransferError,
  InstructionType,
  AffirmationStatus,
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

export const getAffirmationStatus = (
  affirmations: InstructionAffirmation[],
  custodianDid: string,
) => {
  const currentAffirmation = affirmations.find(
    (affirmation) => affirmation.identity.did === custodianDid,
  );
  if (!currentAffirmation) return AffirmationStatus.Unknown;

  return currentAffirmation.status;
};

export const getLegErrors = async ({
  leg,
  affirmationsData,
  instructionDetails,
  latestBlock,
}: {
  leg: Leg;
  affirmationsData: InstructionAffirmation[];
  instructionDetails: InstructionDetails;
  latestBlock: number;
}) => {
  const { from, to, asset } = leg;

  const errors = [];
  try {
    const { compliance, restrictions, general } = 'amount' in leg ?
      await (asset as FungibleAsset).settlements.canTransfer({ from, to, amount: leg.amount })
    : await (asset as NftCollection).settlements.canTransfer({ from, to, nfts: leg.nfts })

    if (!compliance.complies) {
      errors.push(`Compliance error`);
    }
    if (restrictions.length) {
      const restrictionErrors = restrictions
        .map((t) => {
          if (t.result) {
            return '';
          }

          return t.restriction.type.toString();
        })
        .filter((value) => !!value);

      if (restrictionErrors.length) {
        errors.push(`Restriction errors: ${restrictionErrors.join(', ')}`);
      }
    }
    if (general.length) {
      const generalErrors = general
        .map((error) => {
          if (
            error === TransferError.InsufficientBalance ||
            error === TransferError.InsufficientPortfolioBalance
          ) {
            const status = getAffirmationStatus(
              affirmationsData,
              from.toHuman().did,
            );
            return status === AffirmationStatus.Affirmed ? '' : error;
          }
          return error;
        })
        .filter((value) => !!value);
      if (generalErrors.length) {
        errors.push(`General errors: ${generalErrors.join(', ')}`);
      }
    }
  } catch (error) {
    errors.push((error as Error).message);
  }

  if (
    instructionDetails.type === InstructionType.SettleManual &&
    instructionDetails.endAfterBlock.toNumber() > latestBlock
  ) {
    errors.push(
      `Block errors: Earliest execution block must be in the past. Current block number is ${latestBlock}`,
    );
  }

  if (
    instructionDetails.type === InstructionType.SettleOnBlock &&
    instructionDetails.endBlock.toNumber() < latestBlock
  ) {
    const fromStatus = getAffirmationStatus(
      affirmationsData,
      from.toHuman().did,
    );
    const toStatus = getAffirmationStatus(affirmationsData, to.toHuman().did);
    if (
      !(fromStatus === AffirmationStatus.Affirmed) ||
      !(toStatus === AffirmationStatus.Affirmed)
    ) {
      errors.push(
        `Block errors: The scheduled block executed before all approvals were received. Current block number is ${latestBlock}`,
      );
    }
  }

  return errors;
};
