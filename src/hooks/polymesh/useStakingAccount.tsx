import { useState, useEffect, useContext, useRef } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  balanceToBigNumber,
  u32ToBigNumber,
} from '@polymeshassociation/polymesh-sdk/utils/conversion';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type { Vec, u32, Compact, u128, Struct } from '@polkadot/types-codec';
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

interface PalletStakingIndividualExposure extends Struct {
  who: AccountId32;
  value: Compact<u128>;
}

interface PalletStakingExposure extends Struct {
  total: Compact<u128>;
  own: Compact<u128>;
  others: Vec<PalletStakingIndividualExposure>;
}

const useStakingAccount = () => {
  const {
    api: { polkadotApi },
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
  } = useContext(StakingContext);

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
  const [nominatedEra, setNominatedEra] = useState<BigNumber | null>(
    stakingAccountInfo.nominatedEra,
  );
  const [activelyStakedOperators, setActivelyStakedOperators] = useState<
    { operatorAccount: string; value: BigNumber }[]
  >(stakingAccountInfo.activelyStakedOperators);

  const stakingKeys = useRef<(string | null)[]>([
    stakingAccountInfo.stashAddress,
    stakingAccountInfo.controllerAddress,
  ]);

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

  const processUnlockingDetails = (
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
  };

  const getStakingDetails = async (account: string) => {
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
  };

  const fetchData = async () => {
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
  };

  const getActiveNominations = async (nominated: string[]) => {
    if (!polkadotApi) return [];
    const nominatedOperatorsPromises = nominated.map(
      async (operatorAccount) => {
        const stakersClipped =
          await polkadotApi.query.staking.erasStakersClipped(
            (activeEraIndex as BigNumber).toNumber(),
            operatorAccount,
          );
        return { operatorAccount, stakersClipped };
      },
    );

    const nominatedStakers: {
      operatorAccount: string;
      stakersClipped: PalletStakingExposure;
    }[] = await Promise.all(nominatedOperatorsPromises);
    // We only want the operators we are actively staking with in the active era
    const backedOperators: Array<{
      operatorAccount: string;
      value: BigNumber;
    }> = [];

    nominatedStakers.forEach(({ operatorAccount, stakersClipped }) => {
      stakersClipped.others.forEach((entry) => {
        if (entry.who.toString() === stashAddress) {
          const value = balanceToBigNumber(entry.value.unwrap());
          backedOperators.push({ operatorAccount, value });
        }
      });
    });
    setActivelyStakedOperators(backedOperators);
  };

  const getNominations = async () => {
    if (!polkadotApi) return;
    try {
      const nominatedAccounts = await polkadotApi.query.staking.nominators(
        stashAddress as string,
      );
      if (nominatedAccounts.isNone) {
        setNominations([]);
        setNominatedEra(null);
        setActivelyStakedOperators([]);
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
      await getActiveNominations(nominated);
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setStakingAccountIsLoading(false);
    }
  };

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
  }, [accountInfoLoading, activeEraIndex, polkadotApi, stashAddress]);

  useEffect(() => {
    if (shouldRefetch) {
      fetchData();
      getNominations();
      setShouldRefetch(false);
    }
  }, [shouldRefetch]);

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
      activelyStakedOperators,
      nominatedEra,
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
  ]);
};

export default useStakingAccount;
