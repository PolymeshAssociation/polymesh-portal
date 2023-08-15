import { useContext } from 'react';
import { Heading, SkeletonLoader, Text } from '~/components/UiKit';
import { DetailsContainer, Label, StyledWrapper, Value } from './styles';
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

  return (
    <StyledWrapper>
      {!eraDurationBlocks || !eraProgress ? (
        <>
          <SkeletonLoader height="100px" width="100px" circle />
          <SkeletonLoader height={16} count={5} containerClassName="info" />
        </>
      ) : (
        <>
          <DonutProgressBar
            duration={eraDurationBlocks.toNumber()}
            progress={eraProgress.toNumber()}
          />
          <DetailsContainer>
            <Heading type="h4">
              Era #{activeEra.index && activeEra.index.toString()}
            </Heading>
            <div>
              <Label>Start: </Label>
              <Value>
                {activeEra.start &&
                  new Date(activeEra.start.toNumber()).toLocaleString()}
              </Value>
            </div>
            <div>
              <Label>Duration: </Label>
              <Value>
                {eraDurationTime &&
                  formatMillisecondsToTime(eraDurationTime.toNumber())}
              </Value>
            </div>
            <div>
              <Label>Progress: </Label>
              <Value>
                {eraProgress && eraDurationBlocks && eraProgress.toString()}/
                {eraDurationBlocks?.toString()}
              </Value>
            </div>
            <div>
              <Label>Next Era: </Label>
              <Value>
                {eraTimeRemaining &&
                  formatMillisecondsToTime(eraTimeRemaining.toNumber())}
              </Value>
            </div>
          </DetailsContainer>
        </>
      )}

      {!epochDurationBlocks || !epochProgress ? (
        <>
          <SkeletonLoader height="100px" width="100px" circle />
          <SkeletonLoader height={16} count={5} containerClassName="info" />
        </>
      ) : (
        <>
          <DonutProgressBar
            duration={epochDurationBlocks.toNumber()}
            progress={epochProgress.toNumber()}
          />
          <DetailsContainer>
            <Heading type="h4">Session #{epochIndex?.toNumber()}</Heading>
            <div>
              <Label>Era Session: </Label>
              <Value>
                {eraSessionNumber?.toString()} of {sessionsPerEra?.toNumber()}
              </Value>
            </div>
            <div>
              <Label>Duration: </Label>
              <Value>
                {epochDurationTime &&
                  formatMillisecondsToTime(epochDurationTime.toNumber())}
              </Value>
            </div>
            <div>
              <Label>Progress: </Label>
              <Value>
                {epochProgress &&
                  epochDurationBlocks &&
                  epochProgress.toString()}
                /{epochDurationBlocks?.toString()}
              </Value>
            </div>
            <div>
              <Label>Next Session: </Label>
              <Value>
                {epochTimeRemaining &&
                  formatMillisecondsToTime(epochTimeRemaining.toNumber())}
              </Value>
            </div>
          </DetailsContainer>
        </>
      )}
      <div>
        <Label>Election Status</Label>
        <Text size="large" bold>
          {electionInProgress == null ? (
            <SkeletonLoader />
          ) : (
            <>{electionInProgress} </>
          )}
        </Text>
      </div>
      <div>
        <Label>Next Operators Election</Label>
        <Text size="large" bold>
          {!timeToNextElection ? (
            <SkeletonLoader />
          ) : (
            <>{formatMillisecondsToTime(timeToNextElection.toNumber())} </>
          )}
        </Text>
      </div>
    </StyledWrapper>
  );
};
