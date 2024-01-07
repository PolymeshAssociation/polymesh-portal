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

interface INftCollectionProps {
  view: ECollectionView;
}

export const NftCollection: React.FC<INftCollectionProps> = ({ view }) => {
  const { nftList, nftListLoading } = useNftCollection();
  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id') || '';
  const nftCollection = searchParams.get('nftCollection') || '';

  useEffect(() => {
    if (portfolioId && !nftListLoading && !nftList.length) {
      if (portfolioId)
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
        <AssetDetailsCard />
      </StyledCollectionContainer>
    );
  }
  return (
    <StyledCollectionContainer>
      <AssetDetailsCardWrapper>
        <AssetDetailsCard />
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
