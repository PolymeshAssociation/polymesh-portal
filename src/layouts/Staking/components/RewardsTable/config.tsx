import { createColumnHelper } from '@tanstack/react-table';

import {
  ACCOUNT_REWARD_COLUMNS,
  IDENTITY_REWARD_COLUMNS,
  ERewardTableTabs,
  IAccountRewardItem,
  IIdentityRewardItem,
  IIdData,
} from './constants';
import {
  IdCellWrapper,
  IconWrapper,
  StyledTime,
  AddressCellWrapper,
} from './styles';
import { CopyToClipboard, Icon } from '~/components';
import { formatKey } from '~/helpers/formatters';

const createRewardEventLink = (data: IIdData | undefined) => {
  if (!data) return '';

  return `${import.meta.env.VITE_SUBSCAN_URL}block/${
    data.blockId
  }?tab=event&&event=${data.eventId}`;
};

export const columns = {
  [ERewardTableTabs.IDENTITY_REWARDS]: IDENTITY_REWARD_COLUMNS.map(
    ({ header, accessor }) => {
      const key = accessor as keyof IIdentityRewardItem;
      const columnHelper = createColumnHelper<IIdentityRewardItem>();
      return columnHelper.accessor(key, {
        header: () => header,
        cell: (info) => {
          const data = info.getValue();

          if (key === 'id') {
            const handleClick = () =>
              window.open(createRewardEventLink(data as IIdData), '_blank');
            return (
              <IdCellWrapper onClick={handleClick}>
                <IconWrapper>
                  <Icon name="ArrowTopRight" />
                </IconWrapper>
                {(data as IIdData)?.eventId}
              </IdCellWrapper>
            );
          }

          if (key === 'dateTime') {
            if (!data) return '';
            const [date, time] = (data as string).split(' ');

            return (
              <span>
                {date} / <StyledTime>{time}</StyledTime>
              </span>
            );
          }

          if (key === 'stash') {
            return (
              <AddressCellWrapper>
                {formatKey(data as string, 6, 6)}
                <CopyToClipboard value={data as string} />
              </AddressCellWrapper>
            );
          }

          return data;
        },
      });
    },
  ),
  [ERewardTableTabs.ACCOUNT_REWARDS]: ACCOUNT_REWARD_COLUMNS.map(
    ({ header, accessor }) => {
      const key = accessor as keyof IAccountRewardItem;
      const columnHelper = createColumnHelper<IAccountRewardItem>();
      return columnHelper.accessor(key, {
        header: () => header,
        cell: (info) => {
          const data = info.getValue();

          if (key === 'id') {
            const handleClick = () =>
              window.open(createRewardEventLink(data as IIdData), '_blank');
            return (
              <IdCellWrapper onClick={handleClick}>
                <IconWrapper>
                  <Icon name="ArrowTopRight" />
                </IconWrapper>
                {(data as IIdData)?.eventId}
              </IdCellWrapper>
            );
          }

          if (key === 'dateTime') {
            if (!data) return '';
            const [date, time] = (data as string).split(' ');

            return (
              <span>
                {date} / <StyledTime>{time}</StyledTime>
              </span>
            );
          }

          return data;
        },
      });
    },
  ),
};
