import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  u32ToBigNumber,
  u64ToBigNumber,
} from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { PalletStakingActiveEraInfo } from '@polymeshassociation/polymesh-sdk/polkadot/types-lookup';
import type { Option } from '@polkadot/types-codec';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import { StakingContext } from '~/context/StakingContext';

interface EraRelatedConstants {
  epochDurationBlocks: BigNumber | null;
  electionLookahead: BigNumber | null;
  sessionsPerEra: BigNumber | null;
  expectedBlockTime: BigNumber | null;
}

const useEraStatus = () => {
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);

  const { setEraStatus, eraStatus } = useContext(StakingContext);

  const [activeEra, setActiveEra] = useState<{
    index: BigNumber | null;
    start: BigNumber | null;
  }>(eraStatus.activeEra);
  const [currentEraIndex, setCurrentEraIndex] = useState<BigNumber | null>(
    eraStatus.currentEraIndex,
  );
  const [currentSessionIndex, setCurrentSessionIndex] =
    useState<BigNumber | null>(eraStatus.currentSessionIndex);
  const [epochIndex, setEpochIndex] = useState<BigNumber | null>(
    eraStatus.epochIndex,
  );
  const [electionInProgress, setElectionInProgress] = useState<
    'Open' | 'Closed' | null
  >(eraStatus.electionInProgress);
  const [currentSlot, setCurrentSlot] = useState<BigNumber | null>(null);
  const [genesisSlot, setGenesisSlot] = useState<BigNumber | null>(null);
  const [eraStartSlot, setEraStartSlot] = useState<BigNumber | null>(null);
  const [eraStartSessionIndex, setEraStartSessionIndex] =
    useState<BigNumber | null>(null);

  const {
    epochDurationBlocks,
    electionLookahead,
    sessionsPerEra,
    expectedBlockTime,
  }: EraRelatedConstants = useMemo(() => {
    if (!polkadotApi) {
      return {
        epochDurationBlocks: null,
        electionLookahead: null,
        sessionsPerEra: null,
        expectedBlockTime: null,
      };
    }

    return {
      epochDurationBlocks: u64ToBigNumber(
        polkadotApi.consts.babe.epochDuration,
      ),
      electionLookahead: u32ToBigNumber(
        polkadotApi.consts.staking.electionLookahead,
      ),
      sessionsPerEra: u32ToBigNumber(polkadotApi.consts.staking.sessionsPerEra),
      expectedBlockTime: u64ToBigNumber(
        polkadotApi.consts.babe.expectedBlockTime,
      ),
    };
  }, [polkadotApi]);

  const epochStartSlot = useMemo(() => {
    if (!genesisSlot || !epochIndex || !epochDurationBlocks) {
      return null;
    }
    return genesisSlot.plus(epochIndex.times(epochDurationBlocks));
  }, [genesisSlot, epochIndex, epochDurationBlocks]);

  const eraProgress = useMemo(() => {
    if (!currentSlot || !eraStartSlot) return null;
    return currentSlot.minus(eraStartSlot);
  }, [currentSlot, eraStartSlot]);

  const epochProgress = useMemo(() => {
    if (!currentSlot || !epochStartSlot) return null;
    return currentSlot.minus(epochStartSlot);
  }, [currentSlot, epochStartSlot]);

  const eraSessionNumber = useMemo(() => {
    if (!eraStartSessionIndex || !currentSessionIndex) return null;
    return currentSessionIndex.minus(eraStartSessionIndex).plus(1);
  }, [currentSessionIndex, eraStartSessionIndex]);

  const eraDurationBlocks = useMemo(() => {
    if (!epochDurationBlocks || !sessionsPerEra) return null;
    return epochDurationBlocks.times(sessionsPerEra);
  }, [epochDurationBlocks, sessionsPerEra]);

  const eraDurationTime = useMemo(() => {
    if (!eraDurationBlocks || !expectedBlockTime) return null;
    return eraDurationBlocks.times(expectedBlockTime);
  }, [eraDurationBlocks, expectedBlockTime]);

  const eraTimeRemaining = useMemo(() => {
    if (!eraProgress || !eraDurationTime || !expectedBlockTime) return null;
    return eraDurationTime.minus(eraProgress.times(expectedBlockTime));
  }, [eraProgress, eraDurationTime, expectedBlockTime]);

  const epochDurationTime = useMemo(() => {
    if (!epochDurationBlocks || !expectedBlockTime) return null;
    return epochDurationBlocks.times(expectedBlockTime);
  }, [epochDurationBlocks, expectedBlockTime]);

  const epochTimeRemaining = useMemo(() => {
    if (!epochProgress || !epochDurationTime || !expectedBlockTime) return null;
    return epochDurationTime.minus(epochProgress.times(expectedBlockTime));
  }, [epochProgress, epochDurationTime, expectedBlockTime]);

  const electionOpenSlot = useMemo(() => {
    if (
      !electionLookahead ||
      !eraStartSlot ||
      !sessionsPerEra ||
      !epochDurationBlocks ||
      !eraDurationBlocks ||
      !currentSlot
    ) {
      return null;
    }
    // Election closes at the end of the 2nd to last epoch
    const closeSlot = eraStartSlot.plus(
      epochDurationBlocks.times(sessionsPerEra.minus(1)),
    );
    let openSlot = closeSlot.minus(electionLookahead);
    // If the open slot has already passed for the active era, report planned open slot for the next era
    if (openSlot.lt(currentSlot)) {
      openSlot = openSlot.plus(eraDurationBlocks);
    }
    return openSlot;
  }, [
    currentSlot,
    electionLookahead,
    epochDurationBlocks,
    eraDurationBlocks,
    eraStartSlot,
    sessionsPerEra,
  ]);

  const timeToNextElection = useMemo(() => {
    if (!currentSlot || !electionOpenSlot || !expectedBlockTime) {
      return null;
    }
    return electionOpenSlot.minus(currentSlot).times(expectedBlockTime);
  }, [currentSlot, electionOpenSlot, expectedBlockTime]);

  // Subscribe to the active era
  useEffect(() => {
    if (!polkadotApi) {
      setActiveEra({ index: null, start: null });
      return undefined;
    }

    let unsubActiveEra: () => void;

    const getActiveEra = async () => {
      try {
        unsubActiveEra = await polkadotApi.query.staking.activeEra(
          (era: Option<PalletStakingActiveEraInfo>) => {
            if (era.isSome) {
              setActiveEra({
                index: u32ToBigNumber(era.unwrap().index),
                start: u64ToBigNumber(era.unwrap().start.unwrapOrDefault()),
              });
            } else {
              setActiveEra({ index: null, start: null });
            }
          },
        );
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getActiveEra();

    return () => {
      if (unsubActiveEra) {
        unsubActiveEra();
      }
    };
  }, [polkadotApi]);

  // Subscribe to the current era
  useEffect(() => {
    if (!polkadotApi) {
      setCurrentEraIndex(null);
      return undefined;
    }

    let unsubCurrentEra: () => void;

    const getCurrentEra = async () => {
      try {
        unsubCurrentEra = await polkadotApi.query.staking.currentEra((era) => {
          setCurrentEraIndex(u32ToBigNumber(era.unwrapOrDefault()));
        });
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getCurrentEra();

    return () => {
      if (unsubCurrentEra) unsubCurrentEra();
    };
  }, [polkadotApi]);

  // Subscribe to the current session index
  useEffect(() => {
    if (!polkadotApi) {
      setCurrentSessionIndex(null);
      return undefined;
    }

    let unsubCurrentSession: () => void;

    const getCurrentEra = async () => {
      try {
        unsubCurrentSession = await polkadotApi.query.session.currentIndex(
          (era) => {
            setCurrentSessionIndex(u32ToBigNumber(era));
          },
        );
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getCurrentEra();

    return () => {
      if (unsubCurrentSession) unsubCurrentSession();
    };
  }, [polkadotApi]);

  // Subscribe to the current babe slot
  useEffect(() => {
    if (!polkadotApi) {
      setCurrentSlot(null);
      return undefined;
    }

    let unsubCurrentSlot: () => void;

    const getCurrentSlot = async () => {
      try {
        unsubCurrentSlot = await polkadotApi.query.babe.currentSlot((slot) => {
          setCurrentSlot(u64ToBigNumber(slot));
        });
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getCurrentSlot();

    return () => {
      if (unsubCurrentSlot) unsubCurrentSlot();
    };
  }, [polkadotApi]);

  // Subscribe to the current babe epoch (=session)
  useEffect(() => {
    if (!polkadotApi) {
      setEpochIndex(null);
      return undefined;
    }

    let unsubEpoch: () => void;

    const getEpochIndex = async () => {
      try {
        unsubEpoch = await polkadotApi.query.babe.epochIndex((index) => {
          setEpochIndex(u64ToBigNumber(index));
        });
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getEpochIndex();

    return () => {
      if (unsubEpoch) unsubEpoch();
    };
  }, [polkadotApi]);

  // Subscribe to election status
  useEffect(() => {
    if (!polkadotApi) {
      setElectionInProgress(null);
      return () => {};
    }
    let unsubElectionStatus: () => void;

    const getElectionStatus = async () => {
      try {
        unsubElectionStatus = await polkadotApi.query.staking.eraElectionStatus(
          (status) => {
            setElectionInProgress(status.type);
          },
        );
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getElectionStatus();

    return () => {
      if (unsubElectionStatus) {
        unsubElectionStatus();
      }
    };
  }, [polkadotApi]);

  // Get the chain genesis slot
  useEffect(() => {
    if (!polkadotApi) {
      setGenesisSlot(null);
      return;
    }

    const getSlot = async () => {
      try {
        const slot = await polkadotApi.query.babe.genesisSlot();
        setGenesisSlot(u64ToBigNumber(slot));
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getSlot();
  }, [polkadotApi]);

  // Calculate the Era start and End slot
  useEffect(() => {
    const { index } = activeEra;
    if (
      !polkadotApi ||
      !index ||
      !epochStartSlot ||
      !epochDurationBlocks ||
      !currentSessionIndex
    ) {
      setEraStartSessionIndex(null);
      setEraStartSlot(null);
      return;
    }

    const getEraStartSession = async () => {
      try {
        const eraStartSession =
          await polkadotApi.query.staking.erasStartSessionIndex(
            index.toString(),
          );
        const startSession = u32ToBigNumber(eraStartSession.unwrapOrDefault());
        const calculatedEraStartSlot = epochStartSlot.minus(
          currentSessionIndex.minus(startSession).times(epochDurationBlocks),
        );
        setEraStartSessionIndex(startSession);
        setEraStartSlot(calculatedEraStartSlot);
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getEraStartSession();
  }, [
    polkadotApi,
    activeEra,
    epochStartSlot,
    epochDurationBlocks,
    currentSessionIndex,
  ]);

  const getTimeUntilEraStart = useCallback(
    (targetEra: BigNumber, timeToPlanned = false) => {
      if (
        !eraTimeRemaining ||
        !eraDurationTime ||
        !activeEra.index ||
        !epochDurationTime
      ) {
        return null;
      }

      const erasUntilStart = targetEra.minus(activeEra.index);
      const timeToEra = erasUntilStart
        .minus(1) // the active era won't be a full era so reduce by one
        .times(eraDurationTime)
        .plus(eraTimeRemaining); // add remaining time from active era

      if (timeToPlanned) {
        return timeToEra.minus(epochDurationTime);
      }
      return timeToEra;
    },
    [activeEra, epochDurationTime, eraDurationTime, eraTimeRemaining],
  );

  useEffect(() => {
    setEraStatus({
      activeEra,
      currentEraIndex,
      currentSessionIndex,
      epochIndex,
      eraDurationBlocks,
      eraDurationTime,
      eraTimeRemaining,
      epochDurationBlocks,
      epochDurationTime,
      epochTimeRemaining,
      eraProgress,
      epochProgress,
      eraSessionNumber,
      sessionsPerEra,
      timeToNextElection,
      electionInProgress,
      getTimeUntilEraStart,
    });
  }, [
    activeEra,
    currentEraIndex,
    currentSessionIndex,
    epochIndex,
    eraDurationBlocks,
    eraDurationTime,
    eraTimeRemaining,
    epochDurationBlocks,
    epochDurationTime,
    epochTimeRemaining,
    eraProgress,
    epochProgress,
    eraSessionNumber,
    sessionsPerEra,
    setEraStatus,
    timeToNextElection,
    electionInProgress,
    getTimeUntilEraStart,
  ]);
};

export default useEraStatus;
