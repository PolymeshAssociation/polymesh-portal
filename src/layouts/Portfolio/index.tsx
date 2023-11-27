import { useSearchParams } from 'react-router-dom';
import { PortfolioNavigation } from './components/PortfolioNavigation';
import { AssetAllocation } from './components/AssetAllocation';
import { PortfolioInfo } from './components/PortfolioInfo';
import { AssetTable } from './components/AssetTable';
import { NftAssetTable } from './components/NftAssetTable';
import { NftView } from './components/NftView';
import { PortfolioGrid, StyledAllocation } from './styles';

const Portfolio = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const nftCollection = searchParams.get('nftCollection');

  return nftCollection ? (
    <NftView />
  ) : (
    <PortfolioGrid>
      <PortfolioNavigation />
      <StyledAllocation>
        {!!id && <PortfolioInfo />}
        <AssetAllocation />
      </StyledAllocation>
      <AssetTable />
      <NftAssetTable />
    </PortfolioGrid>
  );
};

export default Portfolio;
