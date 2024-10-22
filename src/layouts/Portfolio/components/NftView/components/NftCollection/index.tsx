import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ECollectionView } from '../../constants';
import { NftsList } from '../NftsList';
import { NftTable } from '../NftTable';
import { useNftCollection } from './hooks';
import {
  AssetDetailsCardWrapper,
  StyledCollectionContainer,
  StyledListContainer,
} from './styles';
import { AssetDetailsCard } from '~/components/AssetDetailsCard';
import { notifyWarning } from '~/helpers/notifications';
import { useSearchParamAssetDetails } from '~/hooks/polymesh/useSearchParamAssetDetails';

interface INftCollectionProps {
  view: ECollectionView;
}

export const NftCollection: React.FC<INftCollectionProps> = ({ view }) => {
  const { assetDetails, assetDetailsLoading } = useSearchParamAssetDetails();
  const { nftList, nftListLoading } = useNftCollection(assetDetails?.assetId);
  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id') || '';
  const nftCollection = searchParams.get('nftCollection') || '';

  useEffect(() => {
    if (portfolioId && !nftListLoading && !nftList.length) {
      notifyWarning(
        `NFT collection ${nftCollection} not found in Portfolio ID ${portfolioId}`,
      );
    }
  }, [nftCollection, nftList.length, nftListLoading, portfolioId]);

  const handleNftClick = (nftId: number) => {
    setSearchParams(
      portfolioId
        ? { id: portfolioId, nftCollection, nftId: nftId.toString() }
        : { nftCollection, nftId: nftId.toString() },
    );
  };

  if (!nftListLoading && !nftList.length) {
    return (
      <StyledCollectionContainer>
        <AssetDetailsCard
          assetDetails={assetDetails}
          assetDetailsLoading={assetDetailsLoading}
        />
      </StyledCollectionContainer>
    );
  }

  return (
    <StyledCollectionContainer>
      <AssetDetailsCardWrapper>
        <AssetDetailsCard
          assetDetails={assetDetails}
          assetDetailsLoading={assetDetailsLoading}
        />
      </AssetDetailsCardWrapper>
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
