import { useSearchParams } from 'react-router-dom';
import { AssetAllocation } from './components/AssetAllocation';
import { AssetTable } from './components/AssetTable';
import { AssetView } from './components/AssetView';
import { NftAssetTable } from './components/NftAssetTable';
import { NftView } from './components/NftView';
import { PortfolioInfo } from './components/PortfolioInfo';
import { PortfolioNavigation } from './components/PortfolioNavigation';
import { EBalanceHolder, getBalanceHolder } from './helpers';
import { PortfolioGrid, StyledAllocation } from './styles';

const Portfolio = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const holder = searchParams.get('holder');
  const nftCollection = searchParams.get('nftCollection');
  const asset = searchParams.get('asset');
  const selectedHolder = getBalanceHolder(holder, id);

  if (asset) {
    return <AssetView />;
  }

  if (nftCollection) {
    return <NftView />;
  }

  return (
    <PortfolioGrid>
      <PortfolioNavigation />
      <StyledAllocation>
        {selectedHolder === EBalanceHolder.PORTFOLIO && !!id && (
          <PortfolioInfo />
        )}
        <AssetAllocation />
      </StyledAllocation>
      <AssetTable />
      <NftAssetTable />
    </PortfolioGrid>
  );
};

export default Portfolio;
