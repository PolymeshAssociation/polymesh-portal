import { Nft } from '@polymeshassociation/polymesh-sdk/internal';
import {
  DefaultPortfolio,
  NumberedPortfolio,
  Identity,
  InstructionAffirmation,
  AffirmationStatus,
} from '@polymeshassociation/polymesh-sdk/types';
import { getNftImageUrl } from '~/layouts/Portfolio/components/NftView/helpers';

export enum EInstructionDirection {
  INCOMING = 'Receiving',
  OUTGOING = 'Sending',
  INTER_PORTFOLIO = 'Inter-Portfolio',
  NONE = 'None',
  OFF_CHAIN = 'Off Chain',
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
  if (from.owner.did === identity.did && to.owner.did === identity.did) {
    return EInstructionDirection.INTER_PORTFOLIO;
  }
  if (from.owner.did === identity.did) {
    return EInstructionDirection.OUTGOING;
  }
  if (to.owner.did === identity.did) {
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
