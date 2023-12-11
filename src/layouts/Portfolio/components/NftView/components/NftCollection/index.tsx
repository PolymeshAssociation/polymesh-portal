import { useSearchParams } from 'react-router-dom';
import { SkeletonLoader } from '~/components/UiKit';
import { ECollectionView } from '../../constants';
import { NftsList } from '../NftsList';
import { NftTable } from '../NftTable';
import { useNftCollection } from './hooks';
import { CollectionDetails } from './components/CollectionDetails';
import { ICollectionDetails } from './constants';
import {
  StyledCollectionContainer,
  StyledListContainer,
  StyledLoaderWrapper,
} from './styles';

interface INftCollectionProps {
  view: ECollectionView;
}

export const NftCollection: React.FC<INftCollectionProps> = ({ view }) => {
  const { nftList, details, nftListLoading } = useNftCollection();

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

  return (
    <StyledCollectionContainer>
      {nftListLoading ? (
        <StyledLoaderWrapper>
          <SkeletonLoader height={329} />
        </StyledLoaderWrapper>
      ) : (
        <CollectionDetails details={details as ICollectionDetails} />
      )}
      <StyledListContainer>
        {view === ECollectionView.PALLETE ? (
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
        )}
      </StyledListContainer>
    </StyledCollectionContainer>
  );
};
