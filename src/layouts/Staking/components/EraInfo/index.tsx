import { useContext } from 'react';
import { Heading, SkeletonLoader, Text } from '~/components/UiKit';
import {
  DetailsContainer,
  ElectionInfoWrapper,
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

  return (
    <StyledWrapper>
      <StyledEraEpochWrapper>
        {!eraDurationBlocks || !eraProgress ? (
          <>
            <SkeletonLoader
              height="100px"
              width="100px"
              circle
              baseColor="rgba(255,255,255,0.05)"
              highlightColor="rgba(255, 255, 255, 0.24)"
            />
            <DetailsContainer>
              <SkeletonLoader
                height={124}
                width={285}
                containerClassName="info"
                baseColor="rgba(255,255,255,0.05)"
                highlightColor="rgba(255, 255, 255, 0.24)"
              />
            </DetailsContainer>
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
            <SkeletonLoader
              height="100px"
              width="100px"
              circle
              baseColor="rgba(255,255,255,0.05)"
              highlightColor="rgba(255, 255, 255, 0.24)"
            />
            <DetailsContainer>
              <SkeletonLoader
                height={124}
                width={285}
                containerClassName="info"
                baseColor="rgba(255,255,255,0.05)"
                highlightColor="rgba(255, 255, 255, 0.24)"
              />
            </DetailsContainer>
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
      </StyledEraEpochWrapper>
      <ElectionInfoWrapper>
        <div>
          {!timeToNextElection ? (
            <SkeletonLoader
              width={194}
              height={48}
              baseColor="rgba(255,255,255,0.05)"
              highlightColor="rgba(255, 255, 255, 0.24)"
            />
          ) : (
            <StyledElectionItem>
              Next Election
              <Text size="large">
                <>{formatMillisecondsToTime(timeToNextElection.toNumber())}</>
              </Text>
            </StyledElectionItem>
          )}
        </div>
        <div>
          {electionInProgress == null ? (
            <SkeletonLoader
              width={122}
              height={48}
              baseColor="rgba(255,255,255,0.05)"
              highlightColor="rgba(255, 255, 255, 0.24)"
            />
          ) : (
            <StyledElectionItem>
              Election Status
              <Text size="large">{electionInProgress}</Text>
            </StyledElectionItem>
          )}
        </div>
      </ElectionInfoWrapper>
    </StyledWrapper>
  );
};
