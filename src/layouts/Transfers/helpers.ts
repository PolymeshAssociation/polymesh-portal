import {
  FungibleLeg,
  Leg,
  NftLeg,
  OffChainLeg,
} from '@polymeshassociation/polymesh-sdk/types';

export const calculateCounterparties = (
  legs: { leg: Leg; errors: string[] }[],
) => {
  const involvedIdentities = legs
    .map(({ leg }) => {
      // Handling FungibleLeg or NftLeg
      if ('owner' in leg.from && 'owner' in leg.to) {
        return [
          (leg as FungibleLeg | NftLeg).from.owner.did,
          (leg as FungibleLeg | NftLeg).to.owner.did,
        ];
      }
      // Handling OffChainLeg
      if ('did' in leg.from && 'did' in leg.to) {
        return [(leg as OffChainLeg).from.did, (leg as OffChainLeg).to.did];
      }
      return [];
    })
    .flat();

  return involvedIdentities.filter(
    (value, idx, array) => array.indexOf(value) === idx,
  ).length;
};
