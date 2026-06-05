import { Nft } from '@polymeshassociation/polymesh-sdk/internal';
import {
  AffirmationStatus,
  AssetHolder,
  Identity,
  InstructionAffirmation,
} from '@polymeshassociation/polymesh-sdk/types';
import { getNftImageUrl } from '~/layouts/Portfolio/components/NftView/helpers';
import {
  getAffirmationIdentifier,
  getAssetHolderIdentifier,
  getSelectedParticipantIdentifiers,
  isPortfolioHolder,
} from '~/layouts/Transfers/helpers';

export enum EInstructionDirection {
  INCOMING = 'Receiving',
  OUTGOING = 'Sending',
  INTER_PORTFOLIO = 'Inter-Portfolio',
  INTERNAL = 'Internal',
  NONE = 'None',
  OFF_CHAIN = 'Off Chain',
}

export const getAssetHolderName = async (holder: AssetHolder) => {
  if (!isPortfolioHolder(holder)) {
    return 'Account';
  }

  if ('id' in holder) {
    try {
      return `${holder.id.toString()} / ${await holder.getName()}`;
    } catch (error) {
      return `${holder.id.toString()} / unknown`;
    }
  }

  return 'Default';
};

export const getLegDirection = ({
  from,
  to,
  identity,
  accountAddress,
}: {
  from: AssetHolder;
  to: AssetHolder;
  identity: Identity | null;
  accountAddress?: string;
}) => {
  const selectedParticipants = getSelectedParticipantIdentifiers({
    identityDid: identity?.did,
    accountAddress,
  });

  if (!selectedParticipants.length) {
    return EInstructionDirection.NONE;
  }

  const fromIdentifier = getAssetHolderIdentifier(from);
  const toIdentifier = getAssetHolderIdentifier(to);
  const isFromSelected = selectedParticipants.includes(fromIdentifier);
  const isToSelected = selectedParticipants.includes(toIdentifier);

  if (isFromSelected && isToSelected) {
    if (isPortfolioHolder(from) && isPortfolioHolder(to)) {
      if (from.owner.did === to.owner.did) {
        return EInstructionDirection.INTER_PORTFOLIO;
      }
    }

    return EInstructionDirection.INTERNAL;
  }

  if (isFromSelected) {
    return EInstructionDirection.OUTGOING;
  }

  if (isToSelected) {
    return EInstructionDirection.INCOMING;
  }

  return EInstructionDirection.NONE;
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

export const parseNfts = async (nfts: Nft[]) => {
  const nftsList = await Promise.all(
    nfts.map(async (nft) => {
      const imgUrl = (await getNftImageUrl(nft)) || '';
      return {
        id: nft.id.toNumber(),
        imgUrl,
      };
    }),
  );
  return nftsList;
};
