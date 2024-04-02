import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  TransactionStatus,
  UnsubCallback,
} from '@polymeshassociation/polymesh-sdk/types';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import { StakingContext } from '~/context/StakingContext';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useWindowWidth } from '~/hooks/utility';
import { Modal } from '~/components';
import { SkeletonLoader, Heading } from '~/components/UiKit';
import { StakingButtonOptions } from './components/StakingButtonOptions';
import { AccountDetails } from './components/AccountDetails';
import { NoIdentityInfo } from './components/NoIdentityInfo';
import { NoStakingInfo } from './components/NoStakingInfo';
import { StakingButtons } from './components/StakingButtons';
import { StakeModal } from './components/StakeModal';
import { BondMoreModal } from './components/BondMoreModal';
import { UnbondModal } from './components/UnbondModal';
import { ChangeControllerModal } from './components/ChangeControllerModal';
import { ChangeDestinationModal } from './components/ChangeDestinationModal';
import { ChangeNominationsModal } from './components/ChangeNominationsModal';
import { RebondModal } from './components/RebondModal';
import { useStakeStatusChange } from './hooks';
import {
  EModalOptions,
  EModalActions,
  PAYMENT_DESTINATION,
  IStakeTransaction,
  TStakeArgs,
  IStakeArgs,
} from './constants';
import {
  StyledWrapper,
  StyledButtonWrapper,
  StyledModalContent,
  StyledStakingMessage,
  StyledMessageGroup,
} from './styles';
import { formatMillisecondsToTime } from '~/helpers/formatters';

export const StakingAccountInfo = () => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { identityLoading, identity, selectedAccount } =
    useContext(AccountContext);
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);
  const {
    stakingAccountInfo,
    refetchAccountInfo,
    eraStatus: {
      electionInProgress,
      epochTimeRemaining,
      eraDurationTime,
      epochDurationTime,
      currentEraIndex,
      activeEra,
    },
    operatorInfo: { operatorsWithCommission, operatorLastSlashRecord },
  } = useContext(StakingContext);
  const {
    controllerAddress,
    rewardDestination,
    stashAddress,
    stakingAccountIsLoading,
    nominations,
    amountUnbonding,
    amountActive,
    activelyStakedOperators,
    nominatedEra,
    currentEraStakedOperators,
  } = stakingAccountInfo;
  const { isMobile } = useWindowWidth();

  const [cardWidth, setCardWidth] = useState<number>(0);
  const [optionsExpanded, setOptionsExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState<EModalOptions | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const { handleStakeStatusChange } = useStakeStatusChange();

  const isValidAddress = useCallback(
    (address: string) => {
      if (!sdk) return false;

      try {
        const isValid = sdk.accountManagement.isValidAddress({ address });
        return isValid;
      } catch (error) {
        return false;
      }
    },
    [sdk],
  );

  const rewardAddress = useMemo(
    () =>
      rewardDestination && isValidAddress(rewardDestination)
        ? rewardDestination
        : '',
    [isValidAddress, rewardDestination],
  );
  const ref = useRef<HTMLDivElement>(null);

  const executeAction = async (action: EModalActions, args?: TStakeArgs) => {
    if (!polkadotApi) return;

    setActionInProgress(true);
    setModalOpen(null);

    const transaction: IStakeTransaction = {
      status: TransactionStatus.Unapproved,
      tag: `staking.${action}`,
      isTxBatch: action === EModalActions.BOND,
      batchSize: action === EModalActions.BOND ? 2 : 0,
    };

    handleStakeStatusChange(transaction);
    let unsub: UnsubCallback | undefined;

    try {
      let tx: SubmittableExtrinsic<'promise', ISubmittableResult>;
      if (action === EModalActions.BOND) {
        const transactions = [
          polkadotApi.tx.staking.bond(
            (args as IStakeArgs).controller,
            (args as IStakeArgs).amount,
            (args as IStakeArgs).payee,
          ),
          polkadotApi.tx.staking.nominate((args as IStakeArgs).nominators),
        ];
        tx = polkadotApi.tx.utility.batchAll(transactions);
      } else if (action === EModalActions.WITHDRAW) {
        const optSpans = await polkadotApi.query.staking.slashingSpans(
          stashAddress!,
        );
        const spanCount = optSpans.isNone
          ? 0
          : optSpans.unwrap().prior.length + 1;
        tx = polkadotApi.tx.staking.withdrawUnbonded(spanCount);
      } else {
        tx =
          action !== EModalActions.CHILL
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              polkadotApi.tx.staking[action](args as any)
            : polkadotApi.tx.staking[action]();
      }
      let txHash: string;

      unsub = await tx.signAndSend(selectedAccount, (result) => {
        const { events, status, txHash: rawTxHash } = result;
        if (status.type === 'Ready') {
          txHash = rawTxHash.toString();
          handleStakeStatusChange({
            ...transaction,
            status: TransactionStatus.Running,
            txHash,
          });
        }

        if (status.isInBlock) {
          events.forEach(({ event: { method } }) => {
            if (method === 'ExtrinsicSuccess') {
              handleStakeStatusChange({
                ...transaction,
                status: TransactionStatus.Succeeded,
                txHash,
              });
              refetchAccountInfo();
              setActionInProgress(false);
              if (unsub) unsub();
            } else {
              handleStakeStatusChange({
                ...transaction,
                status: TransactionStatus.Failed,
                txHash,
              });
              setActionInProgress(false);
              if (unsub) unsub();
            }
          });
        }
      });
    } catch (error) {
      handleStakeStatusChange({
        ...transaction,
        status: TransactionStatus.Rejected,
        error: (error as Error).message,
      });
      setActionInProgress(false);
      if (unsub) unsub();
    }
  };

  const toggleOptions = () => setOptionsExpanded((prev) => !prev);

  const toggleModal = (option: EModalOptions | null) => {
    setModalOpen(option);
  };

  const renderModal = () => {
    switch (modalOpen) {
      case EModalOptions.STAKE:
        return (
          <StakeModal
            executeAction={executeAction}
            handleClose={() => toggleModal(null)}
          />
        );
      case EModalOptions.BOND_MORE:
        return (
          <BondMoreModal
            executeAction={executeAction}
            handleClose={() => toggleModal(null)}
          />
        );
      case EModalOptions.UNBOND:
        return (
          <UnbondModal
            amountActive={amountActive?.toNumber() || 0}
            executeAction={executeAction}
            handleClose={() => toggleModal(null)}
          />
        );
      case EModalOptions.CHANGE_CONTROLLER:
        return (
          <ChangeControllerModal
            selectedController={controllerAddress as string}
            executeAction={executeAction}
            handleClose={() => toggleModal(null)}
          />
        );
      case EModalOptions.CHANGE_DESTINATION:
        return (
          <ChangeDestinationModal
            selectedDestination={
              rewardAddress
                ? PAYMENT_DESTINATION.Account
                : (rewardDestination as keyof typeof PAYMENT_DESTINATION)
            }
            rewardAddress={rewardAddress}
            executeAction={executeAction}
            handleClose={() => toggleModal(null)}
          />
        );
      case EModalOptions.CHANGE_NOMINATIONS:
        return (
          <ChangeNominationsModal
            currentNominations={nominations}
            executeAction={executeAction}
            handleClose={() => toggleModal(null)}
          />
        );
      case EModalOptions.REBOND:
        return (
          <RebondModal
            amountUnbonding={amountUnbonding?.toNumber() as number}
            executeAction={executeAction}
            handleClose={() => toggleModal(null)}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (modalOpen) {
      setOptionsExpanded(false);
    }
  }, [modalOpen]);

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

  const checkNominations = useMemo(() => {
    // check we have at least 1 operator nominated from the eligible operators
    const hasNominationInOperators = nominations.some((nomination) =>
      Object.keys(operatorsWithCommission).includes(nomination),
    );
    // check all nominations are for available operators
    const allNominationsInOperators = nominations.every((nomination) =>
      Object.keys(operatorsWithCommission).includes(nomination),
    );
    return { hasNominationInOperators, allNominationsInOperators };
  }, [nominations, operatorsWithCommission]);

  const alertMessage = useMemo(() => {
    if (
      !amountActive ||
      !eraDurationTime ||
      !epochDurationTime ||
      (nominations.length > 0 && !nominatedEra) ||
      !currentEraIndex ||
      !activeEra.index
    ) {
      return null;
    }
    if (amountActive.eq(0)) {
      return (
        <StyledStakingMessage>
          You must bond tokens if you wish to continue staking.
        </StyledStakingMessage>
      );
    }

    if (nominations.length === 0) {
      return (
        <StyledStakingMessage>
          You must nomination at least one operator to begin staking.
        </StyledStakingMessage>
      );
    }
    if (!checkNominations.hasNominationInOperators) {
      let messageSuffix = 'Update your nominations to continue staking.';
      if (activelyStakedOperators.length === 0) {
        if (nominatedEra!.eq(currentEraIndex)) {
          messageSuffix = 'Update your nominations to begin staking.';
        }
        messageSuffix = 'Update your nominations to resume staking.';
      }
      return (
        <StyledStakingMessage>
          None of your nominations are currently eligible for election.{' '}
          {messageSuffix}
        </StyledStakingMessage>
      );
    }
    if (
      !currentEraIndex.eq(activeEra.index) &&
      activelyStakedOperators.length === 0 &&
      currentEraStakedOperators.length > 0
    ) {
      return (
        <StyledStakingMessage>
          You will start/resume staking at the commencement of the next era.
        </StyledStakingMessage>
      );
    }
    if (
      activelyStakedOperators.length === 0 &&
      nominatedEra!.eq(currentEraIndex)
    ) {
      return (
        <StyledStakingMessage>
          Your tokens are bonded but not staked in this era. Your tokens should
          automatically start staking in the era following the next election of
          node operators. (max{' '}
          {Math.floor(
            eraDurationTime.plus(epochDurationTime).div(3600000).toNumber(),
          )}{' '}
          hrs)
        </StyledStakingMessage>
      );
    }
    if (activelyStakedOperators.length === 0) {
      return (
        <StyledStakingMessage>
          You are not staking in the current era. Your nominated operator(s) may
          be oversubscribed or may not have been elected.
        </StyledStakingMessage>
      );
    }
    return null;
  }, [
    activeEra.index,
    activelyStakedOperators.length,
    amountActive,
    checkNominations.hasNominationInOperators,
    currentEraIndex,
    currentEraStakedOperators.length,
    epochDurationTime,
    eraDurationTime,
    nominatedEra,
    nominations.length,
  ]);

  const slashMessage = useMemo(() => {
    if (
      nominations.length === 0 ||
      !nominatedEra ||
      Object.keys(operatorLastSlashRecord).length === 0
    ) {
      return null;
    }
    const renominationRequired = nominations.some(
      (nomination) =>
        operatorLastSlashRecord[nomination] &&
        nominatedEra.lte(operatorLastSlashRecord[nomination]),
    );

    if (renominationRequired) {
      return (
        <StyledStakingMessage>
          One or more of the operators you have nominated has committed an
          offense and had their nominations invalidated. Update your nominations
          if you wish to renominate them.
        </StyledStakingMessage>
      );
    }
    return null;
  }, [nominatedEra, nominations, operatorLastSlashRecord]);

  const ineligibleNominationsMessage = useMemo(() => {
    if (
      checkNominations.hasNominationInOperators &&
      !checkNominations.allNominationsInOperators
    ) {
      return (
        <StyledStakingMessage>
          One of more of your nominations are not eligible for election.
          Consider updating your nominations.
        </StyledStakingMessage>
      );
    }
    return null;
  }, [
    checkNominations.hasNominationInOperators,
    checkNominations.allNominationsInOperators,
  ]);

  const electionInProgressMessage = useMemo(() => {
    if (electionInProgress === 'Open' && epochTimeRemaining) {
      return (
        <StyledStakingMessage>
          An election of Node Operators is in progress. Staking actions will be
          available in {formatMillisecondsToTime(epochTimeRemaining.toNumber())}
          .
        </StyledStakingMessage>
      );
    }
    return null;
  }, [electionInProgress, epochTimeRemaining]);
  const stakingAccountDetails = () => {
    if (stakingAccountIsLoading) {
      return <SkeletonLoader height="100%" />;
    }
    return (
      <>
        {stashAddress ? (
          <AccountDetails cardWidth={cardWidth} />
        ) : (
          <NoStakingInfo />
        )}
        {(alertMessage ||
          ineligibleNominationsMessage ||
          slashMessage ||
          electionInProgressMessage) && (
          <StyledMessageGroup>
            {alertMessage}
            {ineligibleNominationsMessage}
            {slashMessage}
            {electionInProgressMessage}
          </StyledMessageGroup>
        )}
        <div>
          <StyledButtonWrapper $cardWidth={cardWidth}>
            <StakingButtons
              disabled={actionInProgress}
              toggleModal={toggleModal}
              toggleOptions={toggleOptions}
            />
            {stashAddress && optionsExpanded && (
              <StakingButtonOptions
                disabled={actionInProgress}
                executeAction={executeAction}
                toggleModal={toggleModal}
                toggleOptions={toggleOptions}
              />
            )}
          </StyledButtonWrapper>
        </div>
        {modalOpen && (
          <Modal handleClose={() => toggleModal(null)} customWidth="540px">
            <Heading type="h4" marginBottom={32}>
              {modalOpen}
            </Heading>
            <StyledModalContent>{renderModal()}</StyledModalContent>
          </Modal>
        )}
      </>
    );
  };

  return (
    <StyledWrapper ref={ref}>
      {identityLoading && <SkeletonLoader height="100%" />}
      {!identityLoading &&
        (identity ? (
          stakingAccountDetails()
        ) : (
          <NoIdentityInfo cardWidth={cardWidth} isMobile={isMobile} />
        ))}
    </StyledWrapper>
  );
};
