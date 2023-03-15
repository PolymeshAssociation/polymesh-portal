import { PortfolioNavigation } from './components/PortfolioNavigation';
import { AssetAllocation } from './components/AssetAllocation';
import { PortfolioGrid } from './styles';

const Portfolio = () => {
  return (
    <PortfolioGrid allAssets>
      <PortfolioNavigation />
      <AssetAllocation />
    </PortfolioGrid>
  );
};

export default Portfolio;
