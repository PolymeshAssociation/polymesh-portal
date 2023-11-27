import { CellContext } from '@tanstack/react-table';
import Tooltip from '~/components/UiKit/Tooltip';
import { INftMovementItem, INftTransactionItem } from '../../constants';
import { StyledNftsCell, StyledDivider, StyledDots } from './styles';

interface INftIdsCellProps {
  info:
    | CellContext<INftMovementItem, string[]>
    | CellContext<INftTransactionItem, string[]>;
}

export const NftIdsCell: React.FC<INftIdsCellProps> = ({ info }) => {
  const data = info.getValue();
  if (!data) return null;
  return (
    <StyledNftsCell>
      {data.length}
      <StyledDivider>/</StyledDivider>
      <Tooltip caption={data.join(', ')} position="top">
        <StyledDots>...</StyledDots>
      </Tooltip>
    </StyledNftsCell>
  );
};
