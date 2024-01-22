import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { IStakingRewardEvent } from '~/constants/queries/types';
import { toParsedDateTime } from '~/helpers/dateTime';
import { IAccountRewardItem, IIdentityRewardItem } from './constants';

export const parseIdentityRewards = (rewardEvents: IStakingRewardEvent[]) => {
  return rewardEvents.map(
    ({
      id,
      createdBlockId,
      datetime,
      stashAccount,
      amount,
    }: IStakingRewardEvent) => {
      return {
        id: {
          eventId: id.replace('/', '-'),
          blockId: createdBlockId.toString(),
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
    ({ id, createdBlockId, datetime, amount }: IStakingRewardEvent) => {
      return {
        id: {
          eventId: id.replace('/', '-'),
          blockId: createdBlockId.toString(),
        },
        dateTime: toParsedDateTime(datetime),
        amount: new BigNumber(amount).dividedBy(1000000).toString(),
      };
    },
  ) as IAccountRewardItem[];
};
