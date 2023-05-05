import {
  DefaultPortfolio,
  NumberedPortfolio,
  Identity,
  InstructionAffirmation,
  AffirmationStatus,
  Leg,
  TransferError,
} from '@polymeshassociation/polymesh-sdk/types';

export enum EInstructionDirection {
  INCOMING = 'Incoming',
  OUTGOING = 'Outgoing',
  INTER_PORTFOLIO = 'Inter-Portfolio',
  NONE = 'None',
}

export const getLegDirection = ({
  from,
  to,
  identity,
}: {
  from: DefaultPortfolio | NumberedPortfolio;
  to: DefaultPortfolio | NumberedPortfolio;
  identity: Identity;
}) => {
  if (
    from.toHuman().did === identity.did &&
    to.toHuman().did === identity.did
  ) {
    return EInstructionDirection.INTER_PORTFOLIO;
  }
  if (from.toHuman().did === identity.did) {
    return EInstructionDirection.OUTGOING;
  }
  if (to.toHuman().did === identity.did) {
    return EInstructionDirection.INCOMING;
  }
  return EInstructionDirection.NONE;
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
  data,
  affirmationsData,
}: {
  data: Leg;
  affirmationsData: InstructionAffirmation[];
}) => {
  const { from, to, amount, asset } = data;
  const errors = [];
  try {
    const { compliance, restrictions, general } =
      await asset.settlements.canTransfer({
        from,
        to,
        amount,
      });

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
          if (error === TransferError.InsufficientBalance) {
            const status = getAffirmationStatus(
              affirmationsData,
              from.toHuman().did,
            );
            return status === AffirmationStatus.Affirmed ? '' : error;
          }
          return error;
        })
        .filter((value) => !!value);
      errors.push(`General errors: ${generalErrors.join(', ')}`);
    }
  } catch (error) {
    errors.push((error as Error).message);
  }

  return errors;
};
