import { Table } from '~/components';
import { INftListItem } from '../../constants';
import { INftTableItem } from './constants';
import { useNftTable } from './hooks';

interface INftsTableProps {
  nftList: INftListItem[];
  nftListLoading: boolean;
  handleNftClick: (nftId: number) => void;
}

export const NftTable: React.FC<INftsTableProps> = ({
  nftList,
  nftListLoading,
  handleNftClick,
}) => {
  const { table } = useNftTable(nftList);

  const onRowClick = ({ id: { id } }: INftTableItem) => {
    handleNftClick(id);
  };

  return (
    <Table
      data={{ table }}
      loading={nftListLoading}
      totalItems={nftList.length}
      handleRowClick={onRowClick}
    />
  );
};
