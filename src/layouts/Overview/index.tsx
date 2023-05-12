import { OverviewGrid } from './styles';
import { BalanceInfo } from './components/BalanceInfo';
import { KeyInfo } from './components/KeyInfo';
import { DidInfo } from './components/DidInfo';
import { ActivityTable } from './components/ActivityTable';

const Overview = () => {
  return (
    <OverviewGrid>
      <BalanceInfo />
      <KeyInfo />
      <DidInfo />
      <ActivityTable />
    </OverviewGrid>
  );
};

export default Overview;
