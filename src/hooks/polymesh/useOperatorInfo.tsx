import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  balanceToBigNumber,
  u32ToBigNumber,
} from '@polymeshassociation/polymesh-sdk/utils/conversion';
import type { Perbill } from '@polkadot/types/interfaces';
import type { Compact, bool } from '@polkadot/types-codec';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import { StakingContext } from '~/context/StakingContext';
import {
  IEraStakers,
  OperatorLastSlashObject,
  OperatorPrefObject,
} from '~/context/StakingContext/constants';

interface ValidatorPrefs {
  commission: Compact<Perbill>;
  blocked: bool;
}

const useOperatorInfo = () => {
  const {
    api: { polkadotApi, sdk },
  } = useContext(PolymeshContext);
  const {
    eraStatus: { currentEraIndex, activeEra },
    setOperatorInfo,
    operators,
    operatorInfo,
    latestStakingEventBlockHash,
  } = useContext(StakingContext);

  const [activeSessionOperators, setActiveSessionOperators] = useState<
    string[]
  >(operatorInfo.activeSessionOperators);
  const [maxOperatorCount, setMaxOperatorCount] = useState<BigNumber | null>(
    operatorInfo.maxOperatorCount,
  );
  const [operatorCount, setOperatorCount] = useState<number | null>(
    operatorInfo.operatorCount,
  );
  const [operatorsWithCommission, setOperatorsWithCommission] =
    useState<OperatorPrefObject>(operatorInfo.operatorsWithCommission);
  const [waitingOperators, setWaitingOperators] = useState<string[]>(
    operatorInfo.waitingOperators,
  );
  const [currentEraStakers, setCurrentEraStakers] = useState<IEraStakers[]>(
    operatorInfo.operatorStakers.currentEra,
  );
  const [activeEraStakers, setActiveEraStakers] = useState<IEraStakers[]>(
    operatorInfo.operatorStakers.activeEra,
  );
  const [operatorLastSlashRecord, setOperatorLastSlashRecord] =
    useState<OperatorLastSlashObject>(operatorInfo.operatorLastSlashRecord);
  const [operatorNames, setOperatorNames] = useState<Record<string, string>>(
    operatorInfo.operatorNames,
  );

  const activeEraRef = useRef<BigNumber | null>(null);
  const operatorNamesRef = useRef<Record<string, string>>(
    operatorInfo.operatorNames,
  );
  // Get maximum number of operators per era
  useEffect(() => {
    if (!polkadotApi) return;
    (async () => {
      try {
        const maxValidatorCount =
          await polkadotApi.query.staking.validatorCount();
        setMaxOperatorCount(u32ToBigNumber(maxValidatorCount));
      } catch (error) {
        notifyError((error as Error).message);
      }
    })();
  }, [polkadotApi]);

  // Get number of and details for all available Operators including commission
  // and if they are blocking nominations
  useEffect(() => {
    if (!polkadotApi) return;
    (async () => {
      try {
        const validators = await polkadotApi.query.staking.validators.entries();
        setOperatorCount(validators.length);
        const validatorsObject: OperatorPrefObject = {};
        validators.forEach(([key, validatorPrefs]) => {
          const account = key.args.toString();
          const { commission, blocked } = validatorPrefs as ValidatorPrefs;
          const commissionValue = new BigNumber(
            commission.unwrap().toString(),
          ).shiftedBy(-7);
          const blockedValue = blocked.isTrue;
          validatorsObject[account] = {
            commission: commissionValue,
            blocked: blockedValue,
          };
          setOperatorsWithCommission(validatorsObject);
        });
      } catch (error) {
        notifyError((error as Error).message);
      }
    })();
  }, [polkadotApi, latestStakingEventBlockHash]);

  useEffect(() => {
    const fetchDIDAndOperatorName = async () => {
      if (!sdk) return;

      try {
        // Fetch operator names for keys that are not already in the ref
        const keysToFetch = Object.keys(operatorsWithCommission).filter(
          (key) => !operatorNamesRef.current[key],
        );

        // Fetch data in parallel using Promise.all
        const fetchedEntries = await Promise.all(
          keysToFetch.map(async (key) => {
            const account = await sdk.accountManagement.getAccount({
              address: key,
            });
            const accountIdentity = await account.getIdentity();
            const did = accountIdentity?.did;
            return {
              key,
              name: did && operators[did]?.name ? operators[did]?.name : '',
            };
          }),
        );

        // Update state and ref with new entries
        const updatedNames = fetchedEntries.reduce(
          (acc, { key, name }) => {
            if (name) acc[key] = name;
            return acc;
          },
          {} as Record<string, string>,
        );

        setOperatorNames((prev) => ({ ...prev, ...updatedNames }));
        Object.assign(operatorNamesRef.current, updatedNames);
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    fetchDIDAndOperatorName();
  }, [operators, operatorsWithCommission, sdk]);

  // Subscribe to operators in the active session
  useEffect(() => {
    if (!polkadotApi) {
      return () => {};
    }
    let unsubValidators: () => void;

    const getValidators = async () => {
      try {
        unsubValidators = await polkadotApi.query.session.validators(
          (validators) => {
            const validatorArr = validators.map((accountId32) =>
              accountId32.toString(),
            );
            setActiveSessionOperators(validatorArr);
          },
        );
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getValidators();

    return () => {
      if (unsubValidators) {
        unsubValidators();
      }
    };
  }, [polkadotApi]);

  const getEraStakers = useCallback(
    async (eraIndex: BigNumber) => {
      const eraStakerExposure =
        await polkadotApi!.query.staking.erasStakers.entries(
          eraIndex.toNumber(),
        );
      const eraStakers: IEraStakers[] = [];

      eraStakerExposure.forEach(
        ([
          {
            args: [, operatorAccountId],
          },
          stakersClipped,
        ]) => {
          const operatorAccount = operatorAccountId.toString();
          const totalStaked = balanceToBigNumber(stakersClipped.total.unwrap());
          const ownStaked = balanceToBigNumber(stakersClipped.own.unwrap());
          const others: Record<string, BigNumber> = {};

          stakersClipped.others.forEach((entry) => {
            const who = entry.who.toString();
            const value = balanceToBigNumber(entry.value.unwrap());
            others[who] = value;
          });
          eraStakers.push({
            operatorAccount,
            totalStaked,
            ownStaked,
            others,
          });
        },
      );
      return eraStakers;
    },
    [polkadotApi],
  );

  // Get the staking details for the "Current" Era
  useEffect(() => {
    if (!polkadotApi || !currentEraIndex) {
      return;
    }

    const getStakingDetails = async () => {
      try {
        const currentStakers = await getEraStakers(currentEraIndex);
        setCurrentEraStakers(currentStakers);
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getStakingDetails();
  }, [currentEraIndex, getEraStakers, polkadotApi]);

  // Get the staking details for the "Active" Era
  useEffect(() => {
    if (
      !polkadotApi ||
      !currentEraIndex ||
      !activeEra.index ||
      (activeEraRef.current && activeEra.index.eq(activeEraRef.current))
    ) {
      return;
    }

    const activeEraIndex = activeEra.index;
    if (currentEraIndex.eq(activeEraIndex)) {
      // return if currentEraStakers hasn't loaded yet
      if (currentEraStakers.length === 0) {
        return;
      }
      setActiveEraStakers(currentEraStakers);
      activeEraRef.current = activeEraIndex;
      return;
    }
    const getStakingDetails = async () => {
      try {
        const activeStakers = await getEraStakers(activeEraIndex);
        setActiveEraStakers(activeStakers);
        activeEraRef.current = activeEraIndex;
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getStakingDetails();
  }, [
    activeEra.index,
    currentEraIndex,
    currentEraStakers,
    getEraStakers,
    polkadotApi,
  ]);

  // Get list of waiting Operators
  useEffect(() => {
    if (!currentEraStakers || !operatorsWithCommission) return;
    const waiting = Object.keys(operatorsWithCommission).filter(
      (operator) =>
        !currentEraStakers.some((entry) => entry.operatorAccount === operator),
    );
    setWaitingOperators(waiting);
  }, [currentEraStakers, operatorsWithCommission]);

  // Get slash records for operators
  useEffect(() => {
    const availableOperators = Object.keys(operatorsWithCommission);

    if (!polkadotApi || availableOperators.length === 0) {
      return () => {};
    }
    let unsubSlashes: () => void;
    const getLastSlashedEras = async () => {
      try {
        unsubSlashes = await polkadotApi.query.staking.slashingSpans.multi(
          availableOperators,
          (slashingSpans) => {
            const slashRecord: OperatorLastSlashObject = {};
            slashingSpans.forEach((optionSlashingSpan, index) => {
              if (optionSlashingSpan.isSome) {
                slashRecord[availableOperators[index]] = u32ToBigNumber(
                  optionSlashingSpan.unwrap().lastNonzeroSlash,
                );
              }
            });
            setOperatorLastSlashRecord(slashRecord);
          },
        );
      } catch (error) {
        notifyError((error as Error).message);
      }
    };
    getLastSlashedEras();
    return () => {
      if (unsubSlashes) {
        unsubSlashes();
      }
    };
  }, [operatorsWithCommission, polkadotApi]);

  useEffect(() => {
    setOperatorInfo({
      activeSessionOperators,
      maxOperatorCount,
      operatorCount,
      waitingOperators,
      operatorsWithCommission,
      operatorStakers: {
        activeEra: activeEraStakers,
        currentEra: currentEraStakers,
      },
      operatorLastSlashRecord,
      operatorNames,
    });
  }, [
    activeSessionOperators,
    maxOperatorCount,
    operatorCount,
    setOperatorInfo,
    waitingOperators,
    operatorsWithCommission,
    currentEraStakers,
    activeEraStakers,
    operatorLastSlashRecord,
    operatorNames,
  ]);
};

export default useOperatorInfo;
