import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AssetDetailsCard } from '~/components/AssetDetailsCard';
import { notifyWarning } from '~/helpers/notifications';
import { useSearchParamAssetDetails } from '~/hooks/polymesh/useSearchParamAssetDetails';
import {
  buildBalanceSearchParams,
  EBalanceHolder,
  getBalanceHolder,
} from '~/layouts/Portfolio/helpers';
import { ECollectionView } from '../../constants';
import { NftsList } from '../NftsList';
import { NftTable } from '../NftTable';
import { useNftCollection } from './hooks';
import {
  AssetDetailsCardWrapper,
  StyledCollectionContainer,
  StyledListContainer,
} from './styles';

interface INftCollectionProps {
  view: ECollectionView;
}

export const NftCollection: React.FC<INftCollectionProps> = ({ view }) => {
  const { assetDetails, assetDetailsLoading } = useSearchParamAssetDetails();
  const { nftList, nftListLoading } = useNftCollection(assetDetails?.assetId);
  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const holder = searchParams.get('holder');
  const address = searchParams.get('address');
  const nftCollection = searchParams.get('nftCollection') || '';
  const selectedHolder = getBalanceHolder(holder, portfolioId);
  const selectedPortfolioId =
    selectedHolder === EBalanceHolder.PORTFOLIO ? portfolioId : null;

  useEffect(() => {
    if (selectedPortfolioId && !nftListLoading && !nftList.length) {
      notifyWarning(
        `NFT collection ${nftCollection} not found in Portfolio ID ${selectedPortfolioId}`,
      );
    }
  }, [nftCollection, nftList.length, nftListLoading, selectedPortfolioId]);

  const handleNftClick = (nftId: number) => {
    setSearchParams(
      buildBalanceSearchParams({
        holder: selectedHolder,
        portfolioId: selectedPortfolioId,
        accountAddress:
          selectedHolder === EBalanceHolder.ACCOUNT ? address : undefined,
        additionalParams: {
          nftCollection,
          nftId: nftId.toString(),
        },
      }),
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
