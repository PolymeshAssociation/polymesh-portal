import { createColumnHelper } from '@tanstack/react-table';
import { formatBalance, formatDid } from '~/helpers/formatters';
import { Icon, CopyToClipboard } from '~/components';
import { PercentageFilter } from './components/PercentageFilter';
import { TickerCell } from './components/TickerCell';
import {
  IdCellWrapper,
  IconWrapper,
  StyledTime,
  AddressCellWrapper,
  StyledDateTimeCell,
} from './styles';
import {
  EAssetsTableTabs,
  IMovementItem,
  ITokenItem,
  ITransactionItem,
  IIdData,
} from './constants';
import { createTokenActivityLink } from './helpers';

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
        return `${formatBalance(percentage)}%`;
      },
    }),
    tokenColumnHelper.accessor('balance', {
      header: 'Total Balance',
      enableSorting: false,
      cell: (info) => {
        const balance = info.getValue();
        return `${balance?.amount} ${balance?.ticker}`;
      },
    }),
    tokenColumnHelper.accessor('locked', {
      header: 'Locked',
      enableSorting: false,
      cell: (info) => {
        const locked = info.getValue();
        return locked?.amount ? `${locked?.amount} ${locked?.ticker}` : '-';
      },
    }),
  ],
  [EAssetsTableTabs.TRANSACTIONS]: [
    transactionColumnHelper.accessor('id', {
      header: 'Id',
      enableSorting: false,
      cell: (info) => {
        const data = info.getValue();
        const handleClick = () =>
          window.open(createTokenActivityLink(data as IIdData), '_blank');
        return (
          <IdCellWrapper onClick={handleClick}>
            <IconWrapper>
              <Icon name="ArrowTopRight" />
            </IconWrapper>
            {data?.eventId}
          </IdCellWrapper>
        );
      },
    }),
    transactionColumnHelper.accessor('dateTime', {
      header: 'Date / Time',
      cell: (info) => {
        const data = info.getValue();
        if (!data) return '';
        const [date, time] = data.split(' ');

        return (
          <StyledDateTimeCell>
            {date} / <StyledTime>{time}</StyledTime>
          </StyledDateTimeCell>
        );
      },
    }),
    transactionColumnHelper.accessor('from', {
      header: 'From',
      cell: (info) => {
        const data = info.getValue();
        return (
          <AddressCellWrapper>
            {formatDid(data)}
            <CopyToClipboard value={data} />
          </AddressCellWrapper>
        );
      },
    }),
    transactionColumnHelper.accessor('to', {
      header: 'To',
      cell: (info) => {
        const data = info.getValue();
        return (
          <AddressCellWrapper>
            {formatDid(data)}
            <CopyToClipboard value={data} />
          </AddressCellWrapper>
        );
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
