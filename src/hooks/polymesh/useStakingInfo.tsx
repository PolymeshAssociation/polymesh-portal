import { useState, useEffect, useContext, useMemo } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  balanceToBigNumber,
  u128ToBigNumber,
} from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import { StakingContext } from '~/context/StakingContext';

const X_IDEAL = new BigNumber(0.7); // Ideal Staked ratio.
const I_IDEAL = new BigNumber(0.14); // Inflation at ideal staked ratio.
const I_ZERO = new BigNumber(0.025); // Inflation at staked ratio = 0%.
const DECAY = new BigNumber(0.05); // DECAY for staked ratio greater than the ideal
const BN_MILLISECONDS_PER_YEAR = new BigNumber(31_536_000_000); // 1 years assumed as 365 days

const useStakingInfo = () => {
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);
  const {
    eraStatus: { currentEraIndex, epochDurationTime, sessionsPerEra },
    setStakingInfo,
    stakingInfo,
  } = useContext(StakingContext);

  const [totalStaked, setTotalStaked] = useState<BigNumber | null>(
    stakingInfo.totalStaked,
  );
  const [totalIssuance, setTotalIssuance] = useState<BigNumber | null>(
    stakingInfo.totalIssuance,
  );
  const [apr, setApr] = useState<BigNumber | null>(stakingInfo.apr);
  const [inflation, setInflation] = useState<BigNumber | null>(
    stakingInfo.inflation,
  );
  const [percentStaked, setPercentStaked] = useState<BigNumber | null>(
    stakingInfo.percentStaked,
  );

  const { fixedAnnualReward, maxVariableInflationTotalIssuance } =
    useMemo(() => {
      if (!polkadotApi)
        return {
          fixedAnnualReward: null,
          maxVariableInflationTotalIssuance: null,
        };
      return {
        fixedAnnualReward: u128ToBigNumber(
          polkadotApi.consts.staking.fixedYearlyReward,
        ),
        maxVariableInflationTotalIssuance: u128ToBigNumber(
          polkadotApi.consts.staking.maxVariableInflationTotalIssuance,
        ),
      };
    }, [polkadotApi]);

  const erasPerYear = useMemo(() => {
    if (!epochDurationTime || !sessionsPerEra) return null;

    return BN_MILLISECONDS_PER_YEAR.div(
      epochDurationTime.times(sessionsPerEra),
    );
  }, [epochDurationTime, sessionsPerEra]);

  // Get the total POLYX staked in the current era
  useEffect(() => {
    if (!polkadotApi || !currentEraIndex) {
      setTotalStaked(null);
      return;
    }
    const getTotalStaked = async () => {
      try {
        const rawTotal = await polkadotApi.query.staking.erasTotalStake(
          currentEraIndex.toString(),
        );

        setTotalStaked(balanceToBigNumber(rawTotal));
      } catch (error) {
        notifyError((error as Error).message);
      }
    };
    getTotalStaked();
  }, [currentEraIndex, polkadotApi]);

  // Subscribe to the Total POLYX supply
  useEffect(() => {
    if (!polkadotApi) {
      setTotalIssuance(null);
      return () => {};
    }
    let unsubPolyxSupply: () => void;

    const getTotalIssuance = async () => {
      try {
        unsubPolyxSupply = await polkadotApi.query.balances.totalIssuance(
          (total) => {
            setTotalIssuance(balanceToBigNumber(total));
          },
        );
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getTotalIssuance();

    return () => {
      if (unsubPolyxSupply) {
        unsubPolyxSupply();
      }
    };
  }, [polkadotApi]);

  // Calculate Inflation, APR and staked percent
  useEffect(() => {
    if (!totalIssuance || !maxVariableInflationTotalIssuance || !totalStaked)
      return;
    const stakedRatio = totalStaked.div(totalIssuance);

    let inflationRate: BigNumber;

    if (totalIssuance.lt(maxVariableInflationTotalIssuance)) {
      if (stakedRatio.lte(X_IDEAL)) {
        inflationRate = I_ZERO.plus(
          I_IDEAL.minus(I_ZERO).times(stakedRatio.div(X_IDEAL)),
        );
      } else {
        inflationRate = I_ZERO.plus(
          I_IDEAL.minus(I_ZERO).times(
            new BigNumber(2).pow(X_IDEAL.minus(stakedRatio).div(DECAY)),
          ),
        );
      }
    } else {
      inflationRate = fixedAnnualReward.div(totalIssuance);
    }

    const annualTotalReward = inflationRate.times(totalIssuance);
    const calcedApr = annualTotalReward.div(totalStaked).times(100);
    const stakedPercent = stakedRatio.times(100);
    setInflation(inflationRate.times(100));
    setApr(calcedApr);
    setPercentStaked(stakedPercent);
  }, [
    fixedAnnualReward,
    maxVariableInflationTotalIssuance,
    totalIssuance,
    totalStaked,
  ]);

  const apy = useMemo(() => {
    if (!apr || !erasPerYear) return null;
    const perEraRate = apr.dividedBy(erasPerYear.times(100)); // per era interest rate

    return new BigNumber(1)
      .plus(perEraRate)
      .exponentiatedBy(erasPerYear)
      .minus(1)
      .times(100);
  }, [apr, erasPerYear]);

  useEffect(() => {
    setStakingInfo({
      apr,
      apy,
      inflation,
      percentStaked,
      totalIssuance,
      totalStaked,
    });
  }, [
    apr,
    apy,
    inflation,
    percentStaked,
    setStakingInfo,
    totalIssuance,
    totalStaked,
  ]);
};

export default useStakingInfo;
