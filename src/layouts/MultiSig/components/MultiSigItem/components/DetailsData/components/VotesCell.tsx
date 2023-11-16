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
}

export const VoteCell: React.FC<IVoteCellProps> = ({
  approvalCount,
  rejectionCount,
}) => {
  const { requiredSignatures, signers } = useMultiSigContext();
  return (
    <StyledApprovalItem>
      <StyledInfoItemGreen>
        {approvalCount} of {requiredSignatures}
      </StyledInfoItemGreen>
      <StyledInfoItem>/</StyledInfoItem>
      <StyledInfoItemPink>
        {rejectionCount} of {signers.length - requiredSignatures + 1}
      </StyledInfoItemPink>
    </StyledApprovalItem>
  );
};
