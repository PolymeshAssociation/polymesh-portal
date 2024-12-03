import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  balanceToBigNumber,
  u32ToBigNumber,
} from '@polymeshassociation/polymesh-sdk/utils/conversion';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type { Vec, u32 } from '@polkadot/types-codec';
import { PalletStakingUnlockChunk } from '@polymeshassociation/polymesh-sdk/polkadot/types-lookup';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import { StakingContext } from '~/context/StakingContext';
import { AccountContext } from '~/context/AccountContext';

interface StakingDetails {
  isController: boolean;
  controllerAddress: string | null;
  stashAddress: string | null;
  isStash: boolean;
  totalBonded: BigNumber | null;
  amountActive: BigNumber | null;
  amountUnbonding: BigNumber | null;
  unlockingLots: { amount: BigNumber; era: BigNumber; id: string }[];
  rewardDestination: string | null;
  amountAvailableToWithdraw: BigNumber | null;
}

const useStakingAccount = () => {
  const {
    api: { polkadotApi, sdk },
  } = useContext(PolymeshContext);
  const {
    eraStatus: {
      currentEraIndex,
      activeEra: { index: activeEraIndex },
    },
    setStakingAccountInfo,
    stakingAccountInfo,
    latestStakingEventBlockHash,
    shouldRefetch,
    setShouldRefetch,
    operatorInfo: { operatorStakers, operatorNames },
    operators,
  } = useContext(StakingContext);

  const { activeEra: activeEraStakers, currentEra: currentEraStakers } =
    operatorStakers;
  const { selectedAccount } = useContext(AccountContext);
  const [stakingAccountIsLoading, setStakingAccountIsLoading] = useState(true);
  const [accountInfoLoading, setAccountInfoLoading] = useState(true);
  const [isStash, setIsStash] = useState(stakingAccountInfo.isStash);
  const [isController, setIsController] = useState(
    stakingAccountInfo.isController,
  );
  const [stashAddress, setStashAddress] = useState<string | null>(
    stakingAccountInfo.stashAddress,
  );
  const [controllerAddress, setControllerAddress] = useState<string | null>(
    stakingAccountInfo.controllerAddress,
  );
  const [totalBonded, setTotalBonded] = useState<BigNumber | null>(
    stakingAccountInfo.totalBonded,
  );
  const [amountActive, setAmountActive] = useState<BigNumber | null>(
    stakingAccountInfo.amountActive,
  );
  const [amountUnbonding, setAmountUnbonding] = useState<BigNumber | null>(
    stakingAccountInfo.amountUnbonding,
  );
  const [unbondingLots, setUnbondingLots] = useState<
    { amount: BigNumber; era: BigNumber; id: string }[]
  >(stakingAccountInfo.unbondingLots);
  const [amountAvailableToWithdraw, setAmountAvailableToWithdraw] =
    useState<BigNumber | null>(stakingAccountInfo.amountAvailableToWithdraw);
  const [rewardDestination, setRewardDestination] = useState<string | null>(
    stakingAccountInfo.rewardDestination,
  );
  const [nominations, setNominations] = useState<string[]>(
    stakingAccountInfo.nominations,
  );
  const [nominatedNames, setNominatedNames] = useState<Record<string, string>>(
    stakingAccountInfo.nominatedNames,
  );
  const [nominatedEra, setNominatedEra] = useState<BigNumber | null>(
    stakingAccountInfo.nominatedEra,
  );
  const [activelyStakedOperators, setActivelyStakedOperators] = useState<
    { operatorAccount: string; value: BigNumber }[]
  >(stakingAccountInfo.activelyStakedOperators);
  const [currentEraStakedOperators, setCurrentEraStakedOperators] = useState<
    { operatorAccount: string; value: BigNumber }[]
  >(stakingAccountInfo.currentEraStakedOperators);
  const [inactiveNominations, setInactiveNominations] = useState<string[]>([]);

  const stakingKeys = useRef<(string | null)[]>([
    stakingAccountInfo.stashAddress,
    stakingAccountInfo.controllerAddress,
  ]);
  const nominatedNamesRef = useRef<Record<string, string>>(
    stakingAccountInfo.nominatedNames,
  );

  useEffect(() => {
    // Clear initial values and set IsLoading if the previously stored data is not for the selected account
    if (!stakingKeys.current.includes(selectedAccount)) {
      setStakingAccountIsLoading(true);
      setIsController(false);
      setControllerAddress(null);
      setStashAddress(null);
      setIsStash(false);
      setTotalBonded(null);
      setAmountActive(null);
      setAmountUnbonding(null);
      setUnbondingLots([]);
      setRewardDestination(null);
      setAmountAvailableToWithdraw(null);
      setNominations([]);
      setNominatedEra(null);
      setActivelyStakedOperators([]);
    } else {
      setStakingAccountIsLoading(false);
    }
  }, [selectedAccount]);

  const processUnlockingDetails = useCallback(
    (
      unlockingDetails: Vec<PalletStakingUnlockChunk>,
    ):
      | [
          BigNumber,
          BigNumber,
          { amount: BigNumber; era: BigNumber; id: string }[],
        ]
      | [] => {
      if (!currentEraIndex) return [];
      let totalUnlockingBalance = new BigNumber(0);
      let totalWithdrawableBalance = new BigNumber(0);
      const unlockingLots: { amount: BigNumber; era: BigNumber; id: string }[] =
        [];

      unlockingDetails.forEach(({ value, era }, index) => {
        const parsedValue = balanceToBigNumber(value.unwrap());
        const unlockEra = u32ToBigNumber(era.unwrap());
        totalUnlockingBalance = totalUnlockingBalance.plus(parsedValue);

        if (unlockEra.lte(currentEraIndex)) {
          totalWithdrawableBalance = totalWithdrawableBalance.plus(parsedValue);
        } else {
          unlockingLots.push({
            amount: parsedValue,
            era: unlockEra,
            id: `${era.toString()}-${index}`,
          });
        }
      });

      return [totalUnlockingBalance, totalWithdrawableBalance, unlockingLots];
    },
    [currentEraIndex],
  );

  const getStakingDetails = useCallback(
    async (account: string) => {
      if (!polkadotApi) return null;
      const stakingLedger = await polkadotApi.query.staking.ledger(account);
      if (!stakingLedger.isSome) {
        return null;
      }

      const ledger = stakingLedger.unwrap();
      const { stash, total, active, unlocking } = ledger;

      const [totalUnlockingBalance, totalWithdrawableBalance, unlockingLots] =
        processUnlockingDetails(unlocking);
      const rewardPayee = await polkadotApi.query.staking.payee(stash);
      const payee = rewardPayee.isAccount
        ? rewardPayee.asAccount.toString()
        : rewardPayee.toString();
      return {
        isController: account === selectedAccount,
        controllerAddress: account,
        stashAddress: stash.toString(),
        isStash: stash.toString() === selectedAccount,
        totalBonded: balanceToBigNumber(total.unwrap()),
        amountActive: balanceToBigNumber(active.unwrap()),
        amountUnbonding: totalUnlockingBalance?.minus(
          totalWithdrawableBalance as BigNumber,
        ),
        unlockingLots,
        rewardDestination: payee,
        amountAvailableToWithdraw: totalWithdrawableBalance,
      };
    },
    [polkadotApi, processUnlockingDetails, selectedAccount],
  );

  const fetchData = useCallback(async () => {
    try {
      if (!polkadotApi) return;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      let stakingDetails: StakingDetails | null =
        await getStakingDetails(selectedAccount);

      if (!stakingDetails) {
        const controller =
          await polkadotApi.query.staking.bonded(selectedAccount);
        if (controller.isSome) {
          const controllerKey = controller.unwrap().toString();
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          stakingDetails = await getStakingDetails(controllerKey);
        }
      }

      if (!stakingDetails) {
        stakingDetails = {
          isController: false,
          controllerAddress: null,
          stashAddress: null,
          isStash: false,
          totalBonded: null,
          amountActive: null,
          amountUnbonding: null,
          unlockingLots: [],
          rewardDestination: null,
          amountAvailableToWithdraw: null,
        };
      }

      setIsController(stakingDetails.isController);
      setControllerAddress(stakingDetails.controllerAddress);
      setStashAddress(stakingDetails.stashAddress);
      setIsStash(stakingDetails.isStash);
      setTotalBonded(stakingDetails.totalBonded);
      setAmountActive(stakingDetails.amountActive);
      setAmountUnbonding(stakingDetails.amountUnbonding);
      setUnbondingLots(stakingDetails.unlockingLots);
      setRewardDestination(stakingDetails.rewardDestination);
      setAmountAvailableToWithdraw(stakingDetails.amountAvailableToWithdraw);
      stakingKeys.current = [
        stakingDetails.stashAddress,
        stakingDetails.controllerAddress,
      ];
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setAccountInfoLoading(false);
    }
  }, [getStakingDetails, polkadotApi, selectedAccount]);

  // get staked operators and amounts for the current era
  useEffect(() => {
    if (!stashAddress) return;
    const backedOperators: {
      operatorAccount: string;
      value: BigNumber;
    }[] = [];

    currentEraStakers.forEach(({ operatorAccount, others }) => {
      if (Object.keys(others).includes(stashAddress)) {
        backedOperators.push({ operatorAccount, value: others[stashAddress] });
      }
    });
    setCurrentEraStakedOperators(backedOperators);
  }, [currentEraStakers, stashAddress]);

  // get staked operators and amounts for the active era. Active era will be different
  // than the current era after the election until the start of the next era.
  useEffect(() => {
    if (!stashAddress) return;
    const backedOperators: {
      operatorAccount: string;
      value: BigNumber;
    }[] = [];

    activeEraStakers.forEach(({ operatorAccount, others }) => {
      if (Object.keys(others).includes(stashAddress)) {
        backedOperators.push({ operatorAccount, value: others[stashAddress] });
      }
    });
    setActivelyStakedOperators(backedOperators);
  }, [activeEraStakers, stashAddress]);

  const getNominations = useCallback(async () => {
    if (!polkadotApi) return;
    try {
      const nominatedAccounts = await polkadotApi.query.staking.nominators(
        stashAddress as string,
      );
      if (nominatedAccounts.isNone) {
        setNominations([]);
        setNominatedEra(null);
        return;
      }
      const {
        targets,
        submittedIn,
      }: { targets: Vec<AccountId32>; submittedIn: u32 } =
        nominatedAccounts.unwrap();
      const nominated = targets.map((target) => target.toString());
      setNominations(nominated);
      setNominatedEra(u32ToBigNumber(submittedIn));
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setStakingAccountIsLoading(false);
    }
  }, [polkadotApi, stashAddress]);

  useEffect(() => {
    if (!sdk || Object.keys(operatorNames).length === 0) return;
    const fetchNominatedNames = async () => {
      try {
        const inactiveOperators: string[] = [];
        // we need to fetch the names of all operators that are nominated by the user
        // including those for the current era and next era in case of differences
        const allOperators = new Set([
          ...stakingAccountInfo.nominations,
          ...activelyStakedOperators.map((op) => op.operatorAccount),
        ]);

        // Fetch data in parallel using Promise.all
        const fetchedEntries = await Promise.all(
          Array.from(allOperators).map(async (key) => {
            if (key in operatorNames) {
              return { key, name: operatorNames[key] };
            }
            // Add currently nominated keys that do not have a corresponding entry in operatorNames to inactiveOperators
            if (stakingAccountInfo.nominations.includes(key)) {
              inactiveOperators.push(key);
            }

            if (key in nominatedNamesRef.current) {
              return { key, name: nominatedNamesRef.current[key] };
            }

            const account = await sdk.accountManagement.getAccount({
              address: key,
            });
            const accountIdentity = await account.getIdentity();
            const did = accountIdentity?.did;
            const name =
              did && operators[did]?.name ? operators[did]?.name : '';
            return { key, name };
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

        setNominatedNames(updatedNames);
        Object.assign(nominatedNamesRef.current, updatedNames);
        setInactiveNominations(inactiveOperators);
      } catch (error) {
        notifyError((error as Error).message);
      }
    };

    fetchNominatedNames();
  }, [
    operators,
    stakingAccountInfo.nominations,
    sdk,
    operatorNames,
    activelyStakedOperators,
  ]);

  useEffect(() => {
    if (!polkadotApi || !currentEraIndex) {
      return;
    }
    setAccountInfoLoading(true);
    fetchData();
  }, [
    currentEraIndex,
    polkadotApi,
    selectedAccount,
    latestStakingEventBlockHash,
    fetchData,
  ]);

  useEffect(() => {
    if (!polkadotApi || !activeEraIndex || accountInfoLoading) {
      return;
    }
    if (!stashAddress) {
      setStakingAccountIsLoading(false);
      setNominations([]);
      setNominatedEra(null);
      setActivelyStakedOperators([]);
      return;
    }

    getNominations();
  }, [
    accountInfoLoading,
    activeEraIndex,
    getNominations,
    polkadotApi,
    stashAddress,
  ]);

  useEffect(() => {
    if (shouldRefetch) {
      fetchData();
      getNominations();
      setShouldRefetch(false);
    }
  }, [fetchData, getNominations, setShouldRefetch, shouldRefetch]);

  useEffect(() => {
    setStakingAccountInfo({
      stakingAccountIsLoading,
      isStash,
      isController,
      stashAddress,
      controllerAddress,
      totalBonded,
      amountActive,
      amountUnbonding,
      amountAvailableToWithdraw,
      unbondingLots,
      rewardDestination,
      nominations,
      nominatedNames,
      activelyStakedOperators,
      currentEraStakedOperators,
      nominatedEra,
      inactiveNominations,
    });
  }, [
    stakingAccountIsLoading,
    isStash,
    isController,
    stashAddress,
    controllerAddress,
    totalBonded,
    amountActive,
    amountUnbonding,
    amountAvailableToWithdraw,
    rewardDestination,
    setStakingAccountInfo,
    unbondingLots,
    nominations,
    activelyStakedOperators,
    nominatedEra,
    currentEraStakedOperators,
    nominatedNames,
    inactiveNominations,
  ]);
};

export default useStakingAccount;
