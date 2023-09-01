import { useContext, useEffect, useRef, useState } from 'react';
import { Heading, SkeletonLoader, Text } from '~/components/UiKit';
import {
  ElectionInfoWrapper,
  EmptyRow,
  Label,
  StyledElectionItem,
  StyledEraEpochWrapper,
  StyledWrapper,
  Value,
} from './styles';
import { formatMillisecondsToTime } from '~/helpers/formatters';
import { StakingContext } from '~/context/StakingContext';
import DonutProgressBar from './components/DonutProgressBar';

export const EraInfo = () => {
  const {
    eraStatus: {
      activeEra,
      epochIndex,
      eraProgress,
      epochProgress,
      eraSessionNumber,
      epochDurationBlocks,
      epochDurationTime,
      epochTimeRemaining,
      eraDurationBlocks,
      eraDurationTime,
      eraTimeRemaining,
      sessionsPerEra,
      timeToNextElection,
      electionInProgress,
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

  return (
    <StyledWrapper ref={ref}>
      {!cardWidth ||
      !eraDurationBlocks ||
      !eraProgress ||
      !epochDurationBlocks ||
      !epochProgress ||
      !epochIndex ||
      !eraSessionNumber ||
      !timeToNextElection ||
      !sessionsPerEra ||
      electionInProgress == null ? (
        <SkeletonLoader
          height="100%"
          baseColor="rgba(255,255,255,0.05)"
          highlightColor="rgba(255, 255, 255, 0.24)"
        />
      ) : (
        <>
          <StyledEraEpochWrapper $cardWidth={cardWidth}>
            <Heading centered type="h4" marginBottom={5}>
              Era #{activeEra.index && activeEra.index.toString()}
            </Heading>
            {!(cardWidth < 420) && (
              <DonutProgressBar
                duration={eraDurationBlocks.toNumber()}
                progress={eraProgress.toNumber()}
              />
            )}
            <Label>Start: </Label>
            <Value>
              {activeEra.start &&
                new Date(activeEra.start.toNumber()).toLocaleString(undefined, {
                  hour12: false,
                })}
            </Value>
            <Label>Duration: </Label>
            <Value>
              {eraDurationTime &&
                formatMillisecondsToTime(eraDurationTime.toNumber())}
            </Value>
            <Label>Progress: </Label>
            <Value>
              {eraProgress && eraDurationBlocks && eraProgress.toString()}/
              {eraDurationBlocks.toString()}
              {cardWidth < 420 &&
                ` (${eraProgress
                  .div(eraDurationBlocks)
                  .times(100)
                  .toFixed(1)}%)`}
            </Value>
            <Label>Next Era: </Label>
            <Value>
              {eraTimeRemaining &&
                formatMillisecondsToTime(eraTimeRemaining.toNumber())}
            </Value>

            <Heading centered type="h4" marginTop={15} marginBottom={5}>
              Session #{epochIndex.toNumber()}
            </Heading>
            {!(cardWidth < 420) && (
              <DonutProgressBar
                duration={epochDurationBlocks.toNumber()}
                progress={epochProgress.toNumber()}
              />
            )}
            <Label>Era Session: </Label>
            <Value>
              {eraSessionNumber.toString()} of {sessionsPerEra.toNumber()}
            </Value>
            <Label>Duration: </Label>
            <Value>
              {epochDurationTime &&
                formatMillisecondsToTime(epochDurationTime.toNumber())}
            </Value>
            <Label>Progress: </Label>
            <Value>
              {epochProgress.toString()}/{epochDurationBlocks.toString()}
              {cardWidth < 420 &&
                ` (${epochProgress
                  .div(epochDurationBlocks)
                  .times(100)
                  .toFixed(1)}%)`}
            </Value>
            <Label>Next Session: </Label>
            <Value>
              {epochTimeRemaining &&
                formatMillisecondsToTime(epochTimeRemaining.toNumber())}
            </Value>
            {cardWidth < 420 && (
              <>
                <EmptyRow />
                <Label>Next Election:</Label>
                <Value>
                  {formatMillisecondsToTime(timeToNextElection.toNumber())}
                </Value>
                <Label>Election Status:</Label>
                <Value>{electionInProgress}</Value>
              </>
            )}
          </StyledEraEpochWrapper>
          {cardWidth >= 420 && (
            <ElectionInfoWrapper>
              <div>
                <StyledElectionItem>
                  Next Election
                  <Text size="large">
                    <>
                      {formatMillisecondsToTime(timeToNextElection.toNumber())}
                    </>
                  </Text>
                </StyledElectionItem>
              </div>
              <div>
                <StyledElectionItem>
                  Election Status
                  <Text size="large">{electionInProgress}</Text>
                </StyledElectionItem>
              </div>
            </ElectionInfoWrapper>
          )}
        </>
      )}
    </StyledWrapper>
  );
};
