import { useState, useEffect, useContext } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { u32ToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import type { Perbill } from '@polkadot/types/interfaces';
import type { Compact, bool } from '@polkadot/types-codec';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import { StakingContext } from '~/context/StakingContext';
import { OperatorPrefObject } from '~/context/StakingContext/constants';

interface ValidatorPrefs {
  commission: Compact<Perbill>;
  blocked: bool;
}

const useOperatorInfo = () => {
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);
  const {
    eraStatus: { currentEraIndex },
    setOperatorInfo,
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
    useState<OperatorPrefObject>({});
  const [currentEraOperators, setCurrentEraOperators] = useState<string[]>([]);
  const [waitingOperators, setWaitingOperators] = useState<string[]>([]);

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

  // Get the list of Validators for the "Current" Era
  useEffect(() => {
    if (!polkadotApi || !currentEraIndex) {
      return;
    }

    const getCurrentValidators = async () => {
      try {
        const currentOperators =
          await polkadotApi.query.staking.erasStakers.keys(
            currentEraIndex.toNumber(),
          );
        const operatorArray = currentOperators.map(
          ({ args: [, accountId] }) => {
            return accountId.toString();
          },
        );
        setCurrentEraOperators(operatorArray);
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    getCurrentValidators();
  }, [currentEraIndex, polkadotApi]);

  // Get list of waiting Operations
  useEffect(() => {
    if (!currentEraOperators || !operatorsWithCommission) return;
    const waiting = Object.keys(operatorsWithCommission).filter(
      (operator) => !currentEraOperators.includes(operator),
    );
    setWaitingOperators(waiting);
  }, [currentEraOperators, operatorsWithCommission]);

  useEffect(() => {
    setOperatorInfo({
      activeSessionOperators,
      maxOperatorCount,
      operatorCount,
      waitingOperators,
      operatorsWithCommission,
    });
  }, [
    activeSessionOperators,
    maxOperatorCount,
    operatorCount,
    setOperatorInfo,
    waitingOperators,
    operatorsWithCommission,
  ]);
};

export default useOperatorInfo;
