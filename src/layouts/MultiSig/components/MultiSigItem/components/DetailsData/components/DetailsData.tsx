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
  isHistorical: boolean;
}

const createSubscanUrl = (createdBlockId: string, extrinsicIdx: number) => {
  return `${
    import.meta.env.VITE_SUBSCAN_URL
  }extrinsic/${createdBlockId}-${extrinsicIdx}`;
};

export const DetailsData: React.FC<IDetailsProps> = ({
  item,
  showStatus,
  isHistorical,
}) => {
  const subscanUrlCreatedBlock = createSubscanUrl(
    item.createdBlockId,
    item.extrinsicIdx,
  );
  const subscanUrlUpdatedBlock = createSubscanUrl(item.updatedBlockId, 0);
  return (
    <StyledInfo>
      <StyledInfoBlock>
        Proposal ID
        <StyledInfoLink
          href={subscanUrlCreatedBlock}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.proposalId}
        </StyledInfoLink>
      </StyledInfoBlock>
      {isHistorical && (
        <StyledInfoBlock>
          Block ID
          <StyledInfoLink
            href={subscanUrlUpdatedBlock}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.updatedBlockId}-0
          </StyledInfoLink>
        </StyledInfoBlock>
      )}
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
          hideVotes={isHistorical}
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
