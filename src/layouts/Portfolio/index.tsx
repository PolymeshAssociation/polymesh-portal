import { useSearchParams } from 'react-router-dom';
import { PortfolioNavigation } from './components/PortfolioNavigation';
import { AssetAllocation } from './components/AssetAllocation';
import { PortfolioInfo } from './components/PortfolioInfo';
import { AssetTable } from './components/AssetTable';
import { PortfolioGrid } from './styles';

const Portfolio = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  return (
    <PortfolioGrid allAssets={!id}>
      <PortfolioNavigation />
      <AssetAllocation />
      {!!id && <PortfolioInfo />}
      <AssetTable />
    </PortfolioGrid>
  );
};

export default Portfolio;
