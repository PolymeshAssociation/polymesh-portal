import { createColumnHelper } from '@tanstack/react-table';

import { Icon } from '~/components';
import {
  CallCell,
  CreatorCell,
  DateTimeCell,
  ModuleCell,
  VoteCell,
  StatusCell,
} from '../MultiSigItem';
import { CellIdFilter } from './components/CellIdFilter';
import { IHistoricalMultiSigProposals, IIdData, IVotes } from './constants';
import { StyledIdWrapper, IconWrapper } from './styles';

const columnHelper = createColumnHelper<IHistoricalMultiSigProposals>();

export const columns = [
  columnHelper.accessor('id', {
    header: (info) => <CellIdFilter info={info} />,
    enableSorting: true,
    cell: (info) => {
      const { extrinsicIdx, createdBlockId, proposalId } =
        info.getValue() as IIdData;
      const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        window.open(
          `${
            import.meta.env.VITE_SUBSCAN_URL
          }extrinsic/${createdBlockId}-${extrinsicIdx}`,
          '_blank',
        );
      };
      return (
        <StyledIdWrapper onClick={handleClick}>
          <IconWrapper>
            <Icon name="ArrowTopRight" />
          </IconWrapper>
          {proposalId}
        </StyledIdWrapper>
      );
    },
  }),
  columnHelper.accessor('creatorAccount', {
    header: 'Creator',
    cell: (info) => {
      const data = info.getValue();
      return <CreatorCell creator={data} />;
    },
  }),
  columnHelper.accessor('module', {
    header: 'Module',
    cell: (info) => {
      const data = info.getValue();
      return <ModuleCell module={data} />;
    },
  }),
  columnHelper.accessor('call', {
    header: 'Call',
    cell: (info) => {
      const data = info.getValue();
      return <CallCell call={data} />;
    },
  }),
  columnHelper.accessor('votes', {
    header: 'Approvals / Rejections',
    cell: (info) => {
      const { approvalCount, rejectionCount } = info.getValue() as IVotes;
      return (
        <VoteCell
          approvalCount={approvalCount}
          rejectionCount={rejectionCount}
          hideVotes
        />
      );
    },
  }),
  columnHelper.accessor('datetime', {
    header: 'Created At',
    cell: (info) => {
      const data = info.getValue();
      return <DateTimeCell date={data} />;
    },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const data = info.getValue();
      return <StatusCell status={data} />;
    },
  }),
];
