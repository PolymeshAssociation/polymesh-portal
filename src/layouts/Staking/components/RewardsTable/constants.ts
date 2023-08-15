export const ACCOUNT_REWARD_COLUMNS = [
  {
    header: 'ID',
    accessor: 'id',
  },
  {
    header: 'Date / Time',
    accessor: 'dateTime',
  },
  {
    header: 'Amount',
    accessor: 'amount',
  },
];

export const IDENTITY_REWARD_COLUMNS = [
  {
    header: 'ID',
    accessor: 'id',
  },
  {
    header: 'Date / Time',
    accessor: 'dateTime',
  },
  {
    header: 'Stash',
    accessor: 'stash',
  },
  {
    header: 'Amount',
    accessor: 'amount',
  },
];

export interface IIdData {
  eventId: string;
  blockId: string;
}

export interface IAccountRewardItem {
  id: IIdData;
  dateTime: string;
  amount: string;
}

export interface IIdentityRewardItem {
  id: IIdData;
  dateTime: string;
  stash: string;
  amount: string;
}

export enum ERewardTableTabs {
  ACCOUNT_REWARDS = 'account',
  IDENTITY_REWARDS = 'identity',
}

export const maxQuerySize = 100;
