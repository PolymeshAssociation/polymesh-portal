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

const createSubscanExtrinsicUrl = (
  createdBlockId: string,
  extrinsicIdx: number,
) => {
  return `${
    import.meta.env.VITE_SUBSCAN_URL
  }extrinsic/${createdBlockId}-${extrinsicIdx}`;
};

const createSubscanBlockEventsUrl = (createdBlockId: string) => {
  return `${import.meta.env.VITE_SUBSCAN_URL}block/${createdBlockId}?tab=event`;
};

export const DetailsData: React.FC<IDetailsProps> = ({
  item,
  showStatus,
  isHistorical,
}) => {
  const subscanUrlCreatedBlock = createSubscanExtrinsicUrl(
    item.createdBlock.blockId.toString(),
    item.extrinsicIdx,
  );
  const subscanUrlUpdatedBlock = createSubscanBlockEventsUrl(
    item.updatedBlock.blockId.toString(),
  );
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
          Updated Block
          <StyledInfoLink
            href={subscanUrlUpdatedBlock}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.updatedBlock.blockId.toString()}
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
