import { useMultiSigContext } from '~/context/MultiSigContext';
import {
  StyledInfoItemGreen,
  StyledInfoItem,
  StyledInfoItemPink,
  StyledApprovalItem,
} from '../styles';

interface IVoteCellProps {
  approvalCount: number;
  rejectionCount: number;
  hideVotes: boolean;
}

export const VoteCell: React.FC<IVoteCellProps> = ({
  approvalCount,
  rejectionCount,
  hideVotes,
}) => {
  const { requiredSignatures, signers } = useMultiSigContext();
  return (
    <StyledApprovalItem>
      <StyledInfoItemGreen>
        {approvalCount} {!hideVotes && `of ${requiredSignatures}`}
      </StyledInfoItemGreen>
      <StyledInfoItem>/</StyledInfoItem>
      <StyledInfoItemPink>
        {rejectionCount}{' '}
        {!hideVotes && `of ${signers.length - requiredSignatures + 1}`}
      </StyledInfoItemPink>
    </StyledApprovalItem>
  );
};
