import { useContext, useEffect, useRef, useState } from 'react';
import { Text, SkeletonLoader } from '~/components/UiKit';
import { StyledWrapper, StyledInfoItem, StyledContainer } from './styles';
import { formatBalance } from '~/helpers/formatters';
import { StakingContext } from '~/context/StakingContext';
import Tooltip from '~/components/UiKit/Tooltip';
import { useWindowWidth } from '~/hooks/utility';

export const StakingInfo = () => {
  const {
    stakingInfo: { apr, apy, inflation, percentStaked, totalStaked },
    operatorInfo: {
      maxOperatorCount,
      activeSessionOperators,
      operatorCount,
      waitingOperators,
    },
  } = useContext(StakingContext);
  const ref = useRef<HTMLDivElement>(null);

  const [cardWidth, setCardWidth] = useState<number | null>(null);

  useEffect(() => {
    const container = ref.current;

    const handleResize = () => {
      if (container) {
        setCardWidth(container.clientWidth);
      }
    };

    handleResize(); // Initial calculation

    const resizeObserver = new ResizeObserver(handleResize);

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, []);

  const { windowWidth } = useWindowWidth();

  return (
    <StyledContainer ref={ref}>
      {cardWidth && (
        <StyledWrapper $cardWidth={cardWidth}>
          <StyledInfoItem>
            {!apr ? (
              <SkeletonLoader height={45} width={150} />
            ) : (
              <>
                <Text bold>
                  <>{formatBalance(apr.toNumber(), 2)} % </>
                </Text>
                <span className="item-label">
                  Average APR
                  <Tooltip
                    position="top"
                    caption="Average Annual Percentage Rate, before operator commission is subtracted."
                    maxWidth={cardWidth < 400 ? 200 : undefined}
                  />
                </span>
              </>
            )}
          </StyledInfoItem>
          <StyledInfoItem>
            {!apy ? (
              <SkeletonLoader height={45} width={150} />
            ) : (
              <>
                <Text bold>
                  <>{formatBalance(apy.toNumber(), 2)} %</>
                </Text>
                <span className="item-label">
                  Average APY
                  <Tooltip
                    position={cardWidth && cardWidth < 400 ? 'top' : 'top-left'}
                    caption="Average Annual Percentage Yield, for stakers that are compounding staking rewards, before operator commission is subtracted."
                    maxWidth={cardWidth < 400 ? 200 : undefined}
                  />
                </span>
              </>
            )}
          </StyledInfoItem>
          <StyledInfoItem>
            {!totalStaked || !percentStaked ? (
              <SkeletonLoader height={45} width={150} />
            ) : (
              <>
                <Text bold>
                  <>
                    {formatBalance(totalStaked.toString(), 0)} POLYX (
                    {formatBalance(percentStaked?.toString(), 2)} %)
                  </>
                </Text>
                <div className="item-label">
                  Total Staked
                  <Tooltip
                    position="top"
                    caption="Total POLYX staked and Percentage of total supply staked"
                    maxWidth={cardWidth < 400 ? 200 : undefined}
                  />
                </div>
              </>
            )}
          </StyledInfoItem>
          <StyledInfoItem>
            {!inflation ? (
              <SkeletonLoader height={45} width={150} />
            ) : (
              <>
                <Text bold>{formatBalance(inflation.toString(), 2)} %</Text>
                <span className="item-label">
                  Inflation
                  <Tooltip
                    position={cardWidth < 400 ? 'top-right' : 'top'}
                    caption="The variable annual inflation rate that is a function of the percent of total POLYX that is staked."
                    maxWidth={cardWidth < 400 ? 200 : undefined}
                  />
                </span>
              </>
            )}
          </StyledInfoItem>
          <StyledInfoItem>
            {!operatorCount ? (
              <SkeletonLoader height={45} width={150} />
            ) : (
              <>
                <Text bold>
                  {`${operatorCount} / ${waitingOperators.length}`}
                </Text>
                <span className="item-label">
                  Operators / Waiting
                  <Tooltip
                    position={windowWidth > 1024 ? 'top-left' : 'top'}
                    caption="Number of elected and waiting Node Operators. Waiting Operators are available for election but are not elected in the current Era."
                    maxWidth={cardWidth < 400 ? 200 : undefined}
                  />
                </span>
              </>
            )}
          </StyledInfoItem>
          <StyledInfoItem>
            {!activeSessionOperators.length || !maxOperatorCount ? (
              <SkeletonLoader height={45} width={150} />
            ) : (
              <>
                <Text bold>
                  {`${
                    activeSessionOperators.length
                  } of ${maxOperatorCount.toString()}`}
                </Text>
                <span className="item-label">
                  Filled Operator Slots
                  <Tooltip
                    position={cardWidth < 400 ? 'top' : 'top-left'}
                    caption="The number of operators that have been elected out of the maximum allowable number of operators."
                    maxWidth={cardWidth < 400 ? 200 : undefined}
                  />
                </span>
              </>
            )}
          </StyledInfoItem>
        </StyledWrapper>
      )}
    </StyledContainer>
  );
};
