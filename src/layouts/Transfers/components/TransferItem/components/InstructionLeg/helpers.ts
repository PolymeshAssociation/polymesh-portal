import {
  DefaultPortfolio,
  NumberedPortfolio,
  Identity,
  InstructionAffirmation,
  AffirmationStatus,
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
