import { CellContext } from '@tanstack/react-table';
import { INftMovementItem, INftTransactionItem } from '../../constants';
import { StyledNftsCell } from './styles';

interface INftIdsCellProps {
  info:
    | CellContext<INftTransactionItem, string[]>
    | CellContext<INftMovementItem, string[]>;
}

export const NftIdsCell: React.FC<INftIdsCellProps> = ({ info }) => {
  const data = info.getValue();
  if (!data) return null;
  return <StyledNftsCell>{data.join(', ')}</StyledNftsCell>;
};
