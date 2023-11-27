import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NftCollection } from './components/NftCollection';
import { NftAsset } from './components/NftAsset';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ViewSwitcher } from './components/ViewSwitcher';
import { ECollectionView } from './constants';
import { StyledNavigationHeader } from './styles';

export const NftView = () => {
  const [view, setView] = useState<ECollectionView>(ECollectionView.PALLETE);

  const [searchParams] = useSearchParams();
  const nftId = searchParams.get('nftId');

  return (
    <>
      <StyledNavigationHeader>
        <Breadcrumbs />
        {!nftId && <ViewSwitcher view={view} setView={setView} />}
      </StyledNavigationHeader>
      {nftId ? <NftAsset /> : <NftCollection view={view} />}
    </>
  );
};
