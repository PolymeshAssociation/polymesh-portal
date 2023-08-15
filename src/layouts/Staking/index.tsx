import { OverviewGrid } from './styles';
import { EraInfo } from './components/EraInfo';
import { StakingInfo } from './components/StakingInfo';
import { RewardsTable } from './components/RewardsTable';
import {
  useStakingAccount,
  useStakingInfo,
  useEraStatus,
  useOperatorInfo,
} from '~/hooks/polymesh';
import { StakingAccountInfo } from './components/StakingAccountInfo';

const Staking = () => {
  // The following hooks set values in the StakingContext provider
  useEraStatus();
  useStakingAccount();
  useStakingInfo();
  useOperatorInfo();

  return (
    <OverviewGrid>
      <StakingAccountInfo />
      <EraInfo />
      <StakingInfo />
      <RewardsTable />
    </OverviewGrid>
  );
};

export default Staking;
