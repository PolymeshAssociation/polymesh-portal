import { createColumnHelper } from '@tanstack/react-table';
import { Icon } from '~/components';
import { formatBalance } from '~/helpers/formatters';
import { AssetIdCell } from '../../../../components/AssetIdCell';
import { AddressCell } from '../NftAssetTable/components/AddressCell';
import { DateCell } from '../NftAssetTable/components/DateCell';
import { IdCell } from '../NftAssetTable/components/IdCell';
import { TruncatedTextCell } from '../NftAssetTable/components/TruncatedTextCell';
import {
  formatNameAndTicker,
  MEMO_MAX_WIDTH,
  NAME_MAX_WIDTH,
} from '../NftAssetTable/components/TruncatedTextCell/constants';
import { MovementPartyCell } from '../NftAssetTable/components/MovementPartyCell';
import { PercentageFilter } from './components/PercentageFilter';
import { TokenCell } from './components/TokenCell';
import {
  EAssetsTableTabs,
  IMovementItem,
  ITokenItem,
  ITransactionItem,
} from './constants';
import { createTokenActivityLink } from './helpers';
import { IconWrapper, IdCellWrapper } from './styles';

const tokenColumnHelper = createColumnHelper<ITokenItem>();
const transactionColumnHelper = createColumnHelper<ITransactionItem>();
const movementColumnHelper = createColumnHelper<IMovementItem>();

export const columns = {
  [EAssetsTableTabs.TOKENS]: [
    tokenColumnHelper.accessor('tokenDetails', {
      header: 'Token',
      enableSorting: false,
      cell: (info) => <TokenCell info={info} />,
    }),
    tokenColumnHelper.accessor('assetId', {
      header: 'Asset ID',
      enableSorting: false,
      cell: (info) => <AssetIdCell assetId={info.getValue()} />,
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
        return balance ? formatBalance(balance) : '';
      },
    }),
    tokenColumnHelper.accessor('locked', {
      header: 'Locked',
      enableSorting: false,
      cell: (info) => {
        const locked = info.getValue();
        return locked ? formatBalance(locked) : '-';
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
        return <DateCell data={data} compact />;
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
    transactionColumnHelper.accessor('tokenDetails', {
      header: 'Name',
      enableSorting: false,
      cell: (info) => (
        <TruncatedTextCell
          text={formatNameAndTicker(info.getValue())}
          maxWidth={NAME_MAX_WIDTH}
        />
      ),
    }),
    transactionColumnHelper.accessor('asset', {
      header: 'Asset ID',
      cell: (info) => <AssetIdCell assetId={info.getValue()} />,
    }),
    transactionColumnHelper.accessor('amount', {
      header: 'Amount',
      cell: (info) => info.getValue(),
    }),
    transactionColumnHelper.accessor('memo', {
      header: 'Memo',
      enableSorting: false,
      cell: (info) => (
        <TruncatedTextCell
          text={info.getValue()}
          maxWidth={MEMO_MAX_WIDTH}
          keepCase
        />
      ),
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
      cell: (info) => <DateCell data={info.getValue()} compact />,
    }),
    movementColumnHelper.accessor('from', {
      header: 'From',
      cell: (info) => <MovementPartyCell party={info.getValue()} />,
    }),
    movementColumnHelper.accessor('to', {
      header: 'To',
      cell: (info) => <MovementPartyCell party={info.getValue()} />,
    }),
    movementColumnHelper.accessor('tokenDetails', {
      header: 'Name',
      enableSorting: false,
      cell: (info) => (
        <TruncatedTextCell
          text={formatNameAndTicker(info.getValue())}
          maxWidth={NAME_MAX_WIDTH}
        />
      ),
    }),
    movementColumnHelper.accessor('assetId', {
      header: 'Asset ID',
      cell: (info) => <AssetIdCell assetId={info.getValue()} />,
    }),
    movementColumnHelper.accessor('amount', {
      header: 'Amount',
      cell: (info) => info.getValue(),
    }),
    movementColumnHelper.accessor('memo', {
      header: 'Memo',
      enableSorting: false,
      cell: (info) => (
        <TruncatedTextCell
          text={info.getValue()}
          maxWidth={MEMO_MAX_WIDTH}
          keepCase
        />
      ),
    }),
  ],
};
