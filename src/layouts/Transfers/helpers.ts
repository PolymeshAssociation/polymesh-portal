import {
  Account,
  AssetHolder,
  DefaultPortfolio,
  FungibleLeg,
  Identity,
  InstructionAffirmation,
  Leg,
  NftLeg,
  NumberedPortfolio,
  OffChainLeg,
} from '@polymeshassociation/polymesh-sdk/types';

const IDENTITY_PREFIX = 'identity';
const ACCOUNT_PREFIX = 'account';

const withPrefix = (prefix: string, value: string) => `${prefix}:${value}`;

export const getDidIdentifier = (did: string) =>
  withPrefix(IDENTITY_PREFIX, did);

export const getAccountIdentifier = (address: string) =>
  withPrefix(ACCOUNT_PREFIX, address);

export const isPortfolioHolder = (
  holder: AssetHolder,
): holder is DefaultPortfolio | NumberedPortfolio => 'owner' in holder;

export const getAssetHolderIdentifier = (holder: AssetHolder): string => {
  if (isPortfolioHolder(holder)) {
    return getDidIdentifier(holder.owner.did);
  }

  return getAccountIdentifier(holder.address);
};

export const getAssetHolderOwnerValue = (holder: AssetHolder): string => {
  if (isPortfolioHolder(holder)) {
    return holder.owner.did;
  }

  return holder.address;
};

export const getIdentityOrAccountIdentifier = (
  party: Identity | Account,
): string => {
  if ('did' in party) {
    return getDidIdentifier(party.did);
  }

  return getAccountIdentifier(party.address);
};

export const getAffirmationIdentifier = (
  affirmation: InstructionAffirmation,
): string => getIdentityOrAccountIdentifier(affirmation.party);

export const getSelectedParticipantIdentifiers = ({
  identityDid,
  accountAddress,
}: {
  identityDid?: string | null;
  accountAddress?: string | null;
}) => {
  const participants = [] as string[];

  if (identityDid) {
    participants.push(getDidIdentifier(identityDid));
  }

  if (accountAddress) {
    participants.push(getAccountIdentifier(accountAddress));
  }

  return participants;
};

export const getLegParticipantIdentifiers = (leg: Leg) => {
  if ('offChainAmount' in leg) {
    return [getDidIdentifier(leg.from.did), getDidIdentifier(leg.to.did)];
  }

  return [
    getAssetHolderIdentifier((leg as FungibleLeg | NftLeg).from),
    getAssetHolderIdentifier((leg as FungibleLeg | NftLeg).to),
  ];
};

export const calculateCounterparties = (
  legs: { leg: Leg; errors: string[] }[],
) => {
  const involvedParties = legs.flatMap(({ leg }) => {
    // Handling FungibleLeg or NftLeg
    if ('owner' in leg.from || 'address' in leg.from) {
      return [
        getAssetHolderIdentifier((leg as FungibleLeg | NftLeg).from),
        getAssetHolderIdentifier((leg as FungibleLeg | NftLeg).to),
      ];
    }

    // Handling OffChainLeg
    if ('did' in leg.from && 'did' in leg.to) {
      return [
        getDidIdentifier((leg as OffChainLeg).from.did),
        getDidIdentifier((leg as OffChainLeg).to.did),
      ];
    }

    return [];
  });

  return [...new Set(involvedParties)].length;
};
