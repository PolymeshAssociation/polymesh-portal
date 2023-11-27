import { useSearchParams } from 'react-router-dom';
import { ECollectionView } from '../../constants';
import { NftsList } from '../NftsList';
import { NftTable } from '../NftTable';
import { useNftCollection } from './hooks';

interface INftCollectionProps {
  view: ECollectionView;
}

export const NftCollection: React.FC<INftCollectionProps> = ({ view }) => {
  const { nftList, nftListLoading } = useNftCollection();

  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id') || '';
  const nftCollection = searchParams.get('nftCollection') || '';

  const handleNftClick = (nftId: number) => {
    setSearchParams(
      portfolioId
        ? { id: portfolioId, nftCollection, nftId: nftId.toString() }
        : { nftCollection, nftId: nftId.toString() },
    );
  };

  return view === ECollectionView.PALLETE ? (
    <NftsList
      nftList={nftList}
      nftListLoading={nftListLoading}
      handleNftClick={handleNftClick}
    />
  ) : (
    <NftTable
      nftList={nftList}
      nftListLoading={nftListLoading}
      handleNftClick={handleNftClick}
    />
  );
};
