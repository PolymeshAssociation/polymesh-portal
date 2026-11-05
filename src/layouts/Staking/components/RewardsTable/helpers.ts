import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { IStakingRewardEvent } from '~/constants/queries/types';
import { toParsedDateTime } from '~/helpers/dateTime';
import { IAccountRewardItem, IIdentityRewardItem } from './constants';

export const parseIdentityRewards = (rewardEvents: IStakingRewardEvent[]) => {
  return rewardEvents.map(
    ({
      createdEvent: {
        eventIdx,
        block: { blockId, datetime },
      },
      stashId,
      amount,
    }: IStakingRewardEvent) => {
      return {
        id: {
          eventId: `${blockId}-${eventIdx}`,
          blockId: blockId.toString(),
        },
        dateTime: toParsedDateTime(datetime),
        stash: stashId,
        amount: new BigNumber(amount).dividedBy(1000000).toString(),
      };
    },
  ) as IIdentityRewardItem[];
};

export const parseAccountRewards = (rewardEvents: IStakingRewardEvent[]) => {
  return rewardEvents.map(
    ({
      createdEvent: {
        eventIdx,
        block: { blockId, datetime },
      },
      amount,
    }: IStakingRewardEvent) => {
      return {
        id: {
          eventId: `${blockId}-${eventIdx}`,
          blockId: blockId.toString(),
        },
        dateTime: toParsedDateTime(datetime),
        amount: new BigNumber(amount).dividedBy(1000000).toString(),
      };
    },
  ) as IAccountRewardItem[];
};
