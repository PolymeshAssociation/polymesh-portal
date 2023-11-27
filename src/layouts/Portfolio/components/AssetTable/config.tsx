import { createColumnHelper } from '@tanstack/react-table';
import { formatBalance } from '~/helpers/formatters';
import { Icon } from '~/components';
import { PercentageFilter } from './components/PercentageFilter';
import { TickerCell } from './components/TickerCell';
import {
  IdCellWrapper,
  IconWrapper,
  StyledTime,
  StyledDateTimeCell,
} from './styles';
import {
  EAssetsTableTabs,
  IMovementItem,
  ITokenItem,
  ITransactionItem,
} from './constants';
import { createTokenActivityLink } from './helpers';
import { IdCell } from '../NftAssetTable/components/IdCell';
import { DateCell } from '../NftAssetTable/components/DateCell';
import { AddressCell } from '../NftAssetTable/components/AddressCell';

const tokenColumnHelper = createColumnHelper<ITokenItem>();
const transactionColumnHelper = createColumnHelper<ITransactionItem>();
const movementColumnHelper = createColumnHelper<IMovementItem>();

export const columns = {
  [EAssetsTableTabs.TOKENS]: [
    tokenColumnHelper.accessor('ticker', {
      header: 'Token',
      enableSorting: false,
      cell: (info) => <TickerCell info={info} />,
    }),
    tokenColumnHelper.accessor('percentage', {
      header: (info) => <PercentageFilter info={info} />,
      enableSorting: true,
      cell: (info) => {
        const percentage = info.getValue();
        return `${formatBalance(percentage, 2)}%`;
      },
    }),
    tokenColumnHelper.accessor('balance', {
      header: 'Total Balance',
      enableSorting: false,
      cell: (info) => {
        const balance = info.getValue();
        return balance
          ? `${formatBalance(balance.amount)} ${balance?.ticker}`
          : '';
      },
    }),
    tokenColumnHelper.accessor('locked', {
      header: 'Locked',
      enableSorting: false,
      cell: (info) => {
        const locked = info.getValue();
        return locked?.amount
          ? `${formatBalance(locked.amount)} ${locked?.ticker}`
          : '-';
      },
    }),
  ],
  [EAssetsTableTabs.TRANSACTIONS]: [
    transactionColumnHelper.accessor('id', {
      header: 'Instruction Id',
      enableSorting: false,
      cell: (info) => {
        const data = info.getValue();
        const link = createTokenActivityLink(data);
        return <IdCell link={link} label={data?.instructionId || '-'} />;
      },
    }),
    transactionColumnHelper.accessor('dateTime', {
      header: 'Date / Time',
      cell: (info) => {
        const data = info.getValue();
        if (!data) return '';
        return <DateCell data={data} />;
      },
    }),
    transactionColumnHelper.accessor('from', {
      header: 'From',
      cell: (info) => {
        const data = info.getValue();
        return <AddressCell address={data as string} />;
      },
    }),
    transactionColumnHelper.accessor('to', {
      header: 'To',
      cell: (info) => {
        const data = info.getValue();
        return <AddressCell address={data as string} />;
      },
    }),
    transactionColumnHelper.accessor('asset', {
      header: 'Asset',
      cell: (info) => info.getValue(),
    }),
    transactionColumnHelper.accessor('amount', {
      header: 'Amount',
      cell: (info) => info.getValue(),
    }),
  ],
  [EAssetsTableTabs.MOVEMENTS]: [
    movementColumnHelper.accessor('movementId', {
      header: 'Id',
      enableSorting: false,
      cell: (info) => {
        const data = info.getValue();

        const handleClick = () =>
          window.open(
            `${import.meta.env.VITE_SUBSCAN_URL}extrinsic/${data}`,
            '_blank',
          );
        return (
          <IdCellWrapper onClick={handleClick}>
            <IconWrapper>
              <Icon name="ArrowTopRight" />
            </IconWrapper>
            {data}
          </IdCellWrapper>
        );
      },
    }),
    movementColumnHelper.accessor('dateTime', {
      header: 'Date / Time',
      cell: (info) => {
        const data = info.getValue();
        if (!data) return '';
        const [date, time] = data.split(' ');

        return (
          <StyledDateTimeCell>
            {date} /<StyledTime>{time}</StyledTime>
          </StyledDateTimeCell>
        );
      },
    }),
    movementColumnHelper.accessor('from', {
      header: 'From',
      cell: (info) => info.getValue(),
    }),
    movementColumnHelper.accessor('to', {
      header: 'To',
      cell: (info) => info.getValue(),
    }),
    movementColumnHelper.accessor('asset', {
      header: 'Asset',
      cell: (info) => info.getValue(),
    }),
    movementColumnHelper.accessor('amount', {
      header: 'Amount',
      cell: (info) => info.getValue(),
    }),
  ],
};
