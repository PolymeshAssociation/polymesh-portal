import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { IStakingRewardEvent } from '~/constants/queries/types';
import { toParsedDateTime } from '~/helpers/dateTime';
import { IAccountRewardItem, IIdentityRewardItem } from './constants';

export const parseIdentityRewards = (rewardEvents: IStakingRewardEvent[]) => {
  return rewardEvents.map(
    ({
      id,
      createdEvent,
      createdBlock: { blockId },
      datetime,
      stashAccount,
      amount,
    }: IStakingRewardEvent) => {
      return {
        id: {
          eventId: createdEvent
            ? `${blockId}-${createdEvent.eventIdx}`
            : id.replace('/', '-'),
          blockId: blockId.toString(),
        },
        dateTime: toParsedDateTime(datetime),
        stash: stashAccount,
        amount: new BigNumber(amount).dividedBy(1000000).toString(),
      };
    },
  ) as IIdentityRewardItem[];
};

export const parseAccountRewards = (rewardEvents: IStakingRewardEvent[]) => {
  return rewardEvents.map(
    ({
      id,
      createdEvent,
      createdBlock: { blockId },
      datetime,
      amount,
    }: IStakingRewardEvent) => {
      return {
        id: {
          eventId: createdEvent
            ? `${blockId}-${createdEvent.eventIdx}`
            : id.replace('/', '-'),
          blockId: blockId.toString(),
        },
        dateTime: toParsedDateTime(datetime),
        amount: new BigNumber(amount).dividedBy(1000000).toString(),
      };
    },
  ) as IAccountRewardItem[];
};
