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
  const { requiredSignatures } = useMultiSigContext();
  return (
    <StyledApprovalItem>
      <StyledInfoItemGreen>
        {approvalCount} of {requiredSignatures}{' '}
      </StyledInfoItemGreen>
      <StyledInfoItem>/</StyledInfoItem>
      <StyledInfoItemPink>
        {rejectionCount} of {requiredSignatures}
      </StyledInfoItemPink>
    </StyledApprovalItem>
  );
};
