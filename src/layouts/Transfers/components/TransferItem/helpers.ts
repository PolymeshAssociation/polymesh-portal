import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import {
  AffirmationStatus,
  FungibleAsset,
  Identity,
  InstructionAffirmation,
  InstructionDetails,
  InstructionType,
  Leg,
  NftCollection,
  TransferError,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  getAffirmationIdentifier,
  getAssetHolderIdentifier,
  getSelectedParticipantIdentifiers,
} from '../../helpers';

export const isLastManualAffirmation = ({
  instructionAffirmations,
  counterparties,
  identity,
  accountAddress,
}: {
  instructionAffirmations: InstructionAffirmation[];
  counterparties: number;
  identity: Identity | null;
  accountAddress?: string;
}) => {
  const selectedParticipants = getSelectedParticipantIdentifiers({
    identityDid: identity?.did,
    accountAddress,
  });

  if (!selectedParticipants.length) return false;

  if (
    instructionAffirmations.length === counterparties - 1 &&
    !instructionAffirmations.find((affirmation) =>
      selectedParticipants.includes(getAffirmationIdentifier(affirmation)),
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
  participantIdentifier: string,
) => {
  const currentAffirmation = affirmations.find(
    (affirmation) =>
      getAffirmationIdentifier(affirmation) === participantIdentifier,
  );
  if (!currentAffirmation) return AffirmationStatus.Unknown;

  return currentAffirmation.status;
};

export const getSelectedAffirmationStatus = ({
  affirmations,
  identityDid,
  accountAddress,
}: {
  affirmations: InstructionAffirmation[];
  identityDid?: string | null;
  accountAddress?: string;
}) => {
  const selectedParticipants = getSelectedParticipantIdentifiers({
    identityDid,
    accountAddress,
  });

  if (!selectedParticipants.length) {
    return AffirmationStatus.Unknown;
  }

  const statuses = selectedParticipants.map((participant) =>
    getAffirmationStatus(affirmations, participant),
  );

  if (statuses.includes(AffirmationStatus.Affirmed)) {
    return AffirmationStatus.Affirmed;
  }

  return (
    statuses.find((status) => status !== AffirmationStatus.Unknown) ||
    AffirmationStatus.Unknown
  );
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
  // We don't check off chain legs for transfer errors
  if ('offChainAmount' in leg) {
    return [];
  }

  const { from, to, asset } = leg;

  const errors = [];
  try {
    const { compliance, restrictions, general } =
      'amount' in leg
        ? await (asset as FungibleAsset).settlements.canTransfer({
            from,
            to,
            amount: leg.amount,
          })
        : await (asset as NftCollection).settlements.canTransfer({
            from,
            to,
            nfts: leg.nfts,
          });

    if (compliance.requirements.length > 0 && !compliance.complies) {
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
              getAssetHolderIdentifier(from),
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
      getAssetHolderIdentifier(from),
    );
    const toStatus = getAffirmationStatus(
      affirmationsData,
      getAssetHolderIdentifier(to),
    );
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

export const dedupeAffirmations = (
  affirmations: InstructionAffirmation[],
): InstructionAffirmation[] => {
  return affirmations.filter(
    (affirmation, index, self) =>
      index ===
      self.findIndex(
        (candidate) =>
          getAffirmationIdentifier(candidate) ===
          getAffirmationIdentifier(affirmation),
      ),
  );
};
