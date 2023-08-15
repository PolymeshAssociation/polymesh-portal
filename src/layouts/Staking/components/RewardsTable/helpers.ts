import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { IStakingRewardEvent } from '~/constants/queries/types';
import { toParsedDateTime } from '~/helpers/dateTime';
import { IAccountRewardItem, IIdentityRewardItem } from './constants';
import { accountKeyToAddress } from '~/helpers/formatters';

export const parseIdentityRewards = (
  rewardEvents: IStakingRewardEvent[],
  ss58Prefix: BigNumber,
) => {
  return rewardEvents.map(
    ({ id, blockId, block, eventArg1, eventArg2 }: IStakingRewardEvent) => {
      return {
        id: {
          eventId: id.replace('/', '-'),
          blockId: blockId.toString(),
        },
        dateTime: toParsedDateTime(block.datetime),
        stash: accountKeyToAddress(eventArg1, ss58Prefix),
        amount: new BigNumber(eventArg2).dividedBy(1000000).toString(),
      };
    },
  ) as IIdentityRewardItem[];
};

export const parseAccountRewards = (rewardEvents: IStakingRewardEvent[]) => {
  return rewardEvents.map(
    ({ id, blockId, block, eventArg2 }: IStakingRewardEvent) => {
      return {
        id: {
          eventId: id.replace('/', '-'),
          blockId: blockId.toString(),
        },
        dateTime: toParsedDateTime(block.datetime),
        amount: new BigNumber(eventArg2).dividedBy(1000000).toString(),
      };
    },
  ) as IAccountRewardItem[];
};
