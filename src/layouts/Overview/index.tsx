import { OverviewGrid } from './styles';
import { BalanceInfo } from './components/BalanceInfo';
import { KeyInfo } from './components/KeyInfo';
import { DidInfo } from './components/DidInfo';

const Overview = () => {
  return (
    <OverviewGrid>
      <BalanceInfo />
      <KeyInfo />
      <DidInfo />
    </OverviewGrid>
  );
};

export default Overview;
