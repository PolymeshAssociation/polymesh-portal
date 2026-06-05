import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  u32ToBigNumber,
  u64ToBigNumber,
} from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { StakingContext } from '~/context/StakingContext';
import { notifyError } from '~/helpers/notifications';

interface EraRelatedConstants {
  epochDurationBlocks: BigNumber | null;
  unsignedPhaseSlots: BigNumber | null;
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
  const [eraStartSessionIndex, setEraStartSessionIndex] =
    useState<BigNumber | null>(null);

  const {
    epochDurationBlocks,
    unsignedPhaseSlots,
    sessionsPerEra,
    expectedBlockTime,
  }: EraRelatedConstants = useMemo(() => {
    if (!polkadotApi) {
      return {
        epochDurationBlocks: null,
        unsignedPhaseSlots: null,
        sessionsPerEra: null,
        expectedBlockTime: null,
      };
    }

    const epochDuration = u64ToBigNumber(polkadotApi.consts.babe.epochDuration);

    return {
      epochDurationBlocks: epochDuration,
      // Signed/unsigned phase constants are no longer exposed in metadata.
      // Polymesh runtime uses UnsignedPhase = EPOCH_DURATION_IN_BLOCKS / 4.
      unsignedPhaseSlots: epochDuration.div(4),
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

  const eraDurationBlocks = useMemo(() => {
    if (!epochDurationBlocks || !sessionsPerEra) return null;
    return epochDurationBlocks.times(sessionsPerEra);
  }, [epochDurationBlocks, sessionsPerEra]);

  const eraStartSlot = useMemo(() => {
    if (
      !epochStartSlot ||
      !eraStartSessionIndex ||
      !currentSessionIndex ||
      !epochDurationBlocks
    ) {
      return null;
    }
    return epochStartSlot.minus(
      currentSessionIndex
        .minus(eraStartSessionIndex)
        .times(epochDurationBlocks),
    );
  }, [
    epochStartSlot,
    eraStartSessionIndex,
    currentSessionIndex,
    epochDurationBlocks,
  ]);

  const eraSessionNumber = useMemo(() => {
    if (!eraStartSessionIndex || !currentSessionIndex || !sessionsPerEra)
      return null;
    return BigNumber.min(
      currentSessionIndex.minus(eraStartSessionIndex).plus(1),
      sessionsPerEra,
    );
  }, [currentSessionIndex, eraStartSessionIndex, sessionsPerEra]);

  const eraProgress = useMemo(() => {
    if (!currentSlot || !eraStartSlot) return null;
    return currentSlot.minus(eraStartSlot);
  }, [currentSlot, eraStartSlot]);

  const epochProgress = useMemo(() => {
    if (!currentSlot || !epochStartSlot) return null;
    return currentSlot.minus(epochStartSlot);
  }, [currentSlot, epochStartSlot]);

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
      !unsignedPhaseSlots ||
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
    let openSlot = closeSlot.minus(unsignedPhaseSlots);

    // If the open slot already passed, report the next era's opening slot.
    if (openSlot.lt(currentSlot)) {
      openSlot = openSlot.plus(eraDurationBlocks);
    }

    return openSlot;
  }, [
    unsignedPhaseSlots,
    eraStartSlot,
    sessionsPerEra,
    epochDurationBlocks,
    eraDurationBlocks,
    currentSlot,
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
        unsubActiveEra = await polkadotApi.query.staking.activeEra((era) => {
          if (era.isSome) {
            setActiveEra({
              index: u32ToBigNumber(era.unwrap().index),
              start: u64ToBigNumber(era.unwrap().start.unwrapOrDefault()),
            });
          } else {
            setActiveEra({ index: null, start: null });
          }
        });
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
        unsubElectionStatus =
          await polkadotApi.query.electionProviderMultiPhase.currentPhase(
            (phase) => {
              setElectionInProgress(phase.isOff ? 'Closed' : 'Open');
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

  // Fetch the session index at which the active era started. The era start slot
  // is derived reactively in the eraStartSlot useMemo above.
  useEffect(() => {
    const { index } = activeEra;
    if (!polkadotApi || !index) {
      setEraStartSessionIndex(null);
      return;
    }

    const getEraStartSession = async () => {
      try {
        const eraStartSession =
          await polkadotApi.query.staking.erasStartSessionIndex(
            index.toString(),
          );
        setEraStartSessionIndex(
          u32ToBigNumber(eraStartSession.unwrapOrDefault()),
        );
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getEraStartSession();
  }, [polkadotApi, activeEra]);

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
