import { IMultiSigListItem } from '../../../../../types';
import { CallCell } from './CallCell';
import { CreatorCell } from './CreatorCell';
import { DateTimeCell } from './DateTimeCell';
import { ModuleCell } from './ModuleCell';
import { VoteCell } from './VotesCell';
import { StatusCell } from './StatusCell';
import { StyledInfo, StyledInfoBlock, StyledInfoLink } from '../styles';

interface IDetailsProps {
  item: IMultiSigListItem;
  showStatus: boolean;
}

const createSubscanUrl = (createdBlockId: string, extrinsicIdx: number) => {
  return `${
    import.meta.env.VITE_SUBSCAN_URL
  }extrinsic/${createdBlockId}-${extrinsicIdx}`;
};

export const DetailsData: React.FC<IDetailsProps> = ({ item, showStatus }) => {
  const subscanUrl = createSubscanUrl(item.createdBlockId, item.extrinsicIdx);
  return (
    <StyledInfo>
      <StyledInfoBlock>
        Proposal ID
        <StyledInfoLink
          href={subscanUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.proposalId}
        </StyledInfoLink>
      </StyledInfoBlock>
      <StyledInfoBlock>
        Creator
        <CreatorCell creator={item.creatorAccount} />
      </StyledInfoBlock>
      <StyledInfoBlock>
        Module
        <ModuleCell module={item.module} />
      </StyledInfoBlock>
      <StyledInfoBlock>
        Call
        <CallCell call={item.call} />
      </StyledInfoBlock>
      <StyledInfoBlock>
        Approvals / Rejections
        <VoteCell
          approvalCount={item.approvalCount}
          rejectionCount={item.rejectionCount}
        />
      </StyledInfoBlock>
      <StyledInfoBlock>
        Created at
        <DateTimeCell date={item.datetime} />
      </StyledInfoBlock>
      <StyledInfoBlock className="right">
        {showStatus ? (
          <>
            Status
            <StatusCell status={item.status} />
          </>
        ) : (
          <>
            Expiry
            <DateTimeCell date={item.expiry} />
          </>
        )}
      </StyledInfoBlock>
    </StyledInfo>
  );
};
