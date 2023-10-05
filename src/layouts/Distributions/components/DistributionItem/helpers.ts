import { BigNumber } from '@polymeshassociation/polymesh-sdk';
// import { CheckpointSchedule } from '@polymeshassociation/polymesh-sdk/internal';
import {
  FungibleAsset,
  DistributionParticipant,
  DividendDistribution,
} from '@polymeshassociation/polymesh-sdk/types';

export const getDistributionErrors = async ({
  distribution,
  distributionAsset,
  participant,
}: {
  distribution: DividendDistribution;
  distributionAsset: FungibleAsset;
  participant: DistributionParticipant;
}) => {
  //   const checkpoint = await distribution.checkpoint();
  //   if (checkpoint instanceof CheckpointSchedule) {
  //     return [];
  //   }
  //   const amount = await checkpoint.balance({
  //     identity: participant.identity,
  //   });
  const errors = [];

  const amount = new BigNumber(
    Math.ceil(participant.amountAfterTax.toNumber()),
  );

  const { compliance, restrictions, general } =
    await distributionAsset.settlements.canTransfer({
      amount,
      to: await participant.identity.portfolios.getPortfolio(),
      from: await distribution.origin,
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

    if (general.length) {
      errors.push(`General errors: ${general.join(', ')}`);
    }
  }

  return errors;
};
