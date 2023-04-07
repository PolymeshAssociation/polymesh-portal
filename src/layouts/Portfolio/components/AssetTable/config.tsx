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
import { EAssetsTableTabs, ITokenItem, ITransactionItem } from './constants';

const tokenColumnHelper = createColumnHelper<ITokenItem>();
const transactionColumnHelper = createColumnHelper<ITransactionItem>();

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
      header: 'Balance',
      enableSorting: false,
      cell: (info) => {
        const balance = info.getValue();
        return `${balance?.amount} ${balance?.ticker}`;
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
          window.open(
            `${import.meta.env.VITE_SUBSCAN_URL}block/${data}`,
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
    transactionColumnHelper.accessor('dateTime', {
      header: 'Date / Time',
      cell: (info) => {
        const data = info.getValue();
        if (!data) return '';
        const [date, time] = data.split(' ');

        return (
          <span>
            {date} / <StyledTime>{time}</StyledTime>
          </span>
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
    transactionColumnHelper.accessor('direction', {
      header: 'Direction',
      cell: (info) => info.getValue(),
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
    transactionColumnHelper.accessor('id', {
      header: 'Id',
      enableSorting: false,
      cell: (info) => {
        const data = info.getValue();
        const handleClick = () =>
          window.open(
            `${import.meta.env.VITE_SUBSCAN_URL}block/${data.split('/')[0]}`,
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
    transactionColumnHelper.accessor('dateTime', {
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
    transactionColumnHelper.accessor('from', {
      header: 'From',
      cell: (info) => info.getValue(),
    }),
    transactionColumnHelper.accessor('to', {
      header: 'To',
      cell: (info) => info.getValue(),
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
};
