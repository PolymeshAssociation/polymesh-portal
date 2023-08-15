import { useContext } from 'react';
import { Text, SkeletonLoader } from '~/components/UiKit';
import { StyledWrapper, StyledAsset } from './styles';
import { formatBalance } from '~/helpers/formatters';
import { StakingContext } from '~/context/StakingContext';

export const StakingInfo = () => {
  const {
    stakingInfo: {
      apr,
      apy,
      inflation,
      percentStaked,
      totalStaked,
      totalIssuance,
    },
    operatorInfo: {
      maxOperatorCount,
      activeSessionOperators,
      operatorCount,
      waitingOperators,
    },
  } = useContext(StakingContext);

  return (
    <StyledWrapper>
      <div>
        <Text size="large" bold centered>
          {!apr ? (
            <SkeletonLoader />
          ) : (
            <>{formatBalance(apr.toNumber(), 2)} % </>
          )}
        </Text>
        <Text size="medium" centered>
          Average APR
        </Text>
      </div>
      <div>
        <Text size="large" bold centered>
          {!apy ? (
            <SkeletonLoader />
          ) : (
            <>{formatBalance(apy.toNumber(), 2)} %</>
          )}
        </Text>
        <Text size="medium" centered>
          Average APY
        </Text>
      </div>
      <div>
        <Text size="large" bold centered>
          {!totalIssuance ? (
            <SkeletonLoader />
          ) : (
            <>
              {formatBalance(totalIssuance.toString(), 0)}{' '}
              <StyledAsset>POLYX</StyledAsset>
            </>
          )}
        </Text>
        <Text size="medium" centered>
          Total Issuance
        </Text>
      </div>
      <div>
        <Text size="large" bold centered>
          {!totalStaked ? (
            <SkeletonLoader />
          ) : (
            <>
              {formatBalance(totalStaked.toString(), 0)}{' '}
              <StyledAsset>POLYX</StyledAsset>
            </>
          )}
        </Text>
        <Text size="medium" centered>
          Total Staked
        </Text>
      </div>
      <div>
        <Text size="large" bold centered>
          {!percentStaked ? (
            <SkeletonLoader />
          ) : (
            <>
              {formatBalance(percentStaked?.toString(), 2)}{' '}
              <StyledAsset>%</StyledAsset>
            </>
          )}
        </Text>
        <Text size="medium" centered>
          Percent Total Staked
        </Text>
      </div>
      <div>
        <Text size="large" bold centered>
          {!inflation ? (
            <SkeletonLoader />
          ) : (
            <>
              {formatBalance(inflation.toString(), 2)}{' '}
              <StyledAsset>%</StyledAsset>
            </>
          )}
        </Text>
        <Text size="medium" centered>
          Inflation
        </Text>
      </div>

      <div>
        <Text size="large" bold centered>
          {!activeSessionOperators.length || !maxOperatorCount ? (
            <SkeletonLoader />
          ) : (
            `${activeSessionOperators.length} of ${maxOperatorCount.toString()}`
          )}
        </Text>
        <Text size="medium" centered>
          Filled Operators Slots
        </Text>
      </div>
      <div>
        <Text size="large" bold centered>
          {!operatorCount ? (
            <SkeletonLoader />
          ) : (
            `${operatorCount} / ${waitingOperators.length}`
          )}
        </Text>
        <Text size="medium" centered>
          Operators / Waiting
        </Text>
      </div>
    </StyledWrapper>
  );
};
