import { useContext, useEffect, useRef, useState } from 'react';
import { Heading, SkeletonLoader, Text } from '~/components/UiKit';
import { Icon } from '~/components';
import {
  EmptyRow,
  Label,
  StyledElectionItem,
  StyledElectionInfo,
  StyledEraEpochWrapper,
  StyledWrapper,
  Value,
  StyledElectionRow,
  StyledIconWrap,
  StyledIconRing,
} from './styles';
import { formatMillisecondsToTime } from '~/helpers/formatters';
import { StakingContext } from '~/context/StakingContext';
import DonutProgressBar from './components/DonutProgressBar';

export const EraInfo = () => {
  const {
    eraStatus: {
      activeEra,
      currentSessionIndex,
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
      !currentSessionIndex ||
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
            <DonutProgressBar
              duration={eraDurationBlocks.toNumber()}
              progress={eraProgress.toNumber()}
            />
            <Heading type="h4">
              Era #{activeEra.index && activeEra.index.toString()}
            </Heading>
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
            </Value>
            <Label>Next Era: </Label>
            <Value>
              {eraTimeRemaining &&
                formatMillisecondsToTime(eraTimeRemaining.toNumber())}
            </Value>
            <EmptyRow />
            <DonutProgressBar
              duration={epochDurationBlocks.toNumber()}
              progress={epochProgress.toNumber()}
            />
            <Heading type="h4">
              Session #{currentSessionIndex.toNumber()}
            </Heading>
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
            </Value>
            <Label>Next Session: </Label>
            <Value>
              {epochTimeRemaining &&
                formatMillisecondsToTime(epochTimeRemaining.toNumber())}
            </Value>
          </StyledEraEpochWrapper>
          <StyledElectionRow>
            <StyledElectionItem>
              <StyledIconWrap>
                <Icon name="ClockIcon" />
              </StyledIconWrap>
              <StyledElectionInfo>
                Next Election:
                <Text>
                  <>{formatMillisecondsToTime(timeToNextElection.toNumber())}</>
                </Text>
              </StyledElectionInfo>
            </StyledElectionItem>
            <StyledElectionItem>
              <StyledIconWrap>
                <StyledIconRing>
                  {electionInProgress === 'Open' ? (
                    <Icon name="Check" />
                  ) : (
                    <Icon name="CloseIcon" />
                  )}
                </StyledIconRing>
              </StyledIconWrap>
              <StyledElectionInfo>
                Election Status:
                <Text size="large">{electionInProgress}</Text>
              </StyledElectionInfo>
            </StyledElectionItem>
          </StyledElectionRow>
        </>
      )}
    </StyledWrapper>
  );
};
