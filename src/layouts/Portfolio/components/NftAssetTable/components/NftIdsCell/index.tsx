import { CellContext } from '@tanstack/react-table';
import { NavLink } from 'react-router-dom';
import { INftMovementItem } from '../../constants';
import { StyledNftsCell } from './styles';
import { INftTransactionItem } from '~/layouts/Overview/components/ActivityTable/constants';

interface INftIdsCellProps {
  info:
    | CellContext<INftTransactionItem, string[]>
    | CellContext<INftMovementItem, string[]>;
  assetId: string;
}

export const NftIdsCell: React.FC<INftIdsCellProps> = ({ info, assetId }) => {
  const data = info.getValue();
  if (!data) return null;
  return (
    <StyledNftsCell>
      {data.flatMap((nftId, index) => [
        index > 0 && ', ',
        <NavLink
          key={nftId}
          to={`/portfolio?nftCollection=${assetId}&nftId=${nftId}`}
        >
          {nftId}
        </NavLink>,
      ])}
    </StyledNftsCell>
  );
};
