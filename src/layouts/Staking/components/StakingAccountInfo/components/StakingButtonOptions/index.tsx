import { useContext } from 'react';
import { StakingContext } from '~/context/StakingContext';
import { useOutsideClick } from '~/hooks/utility';
import { EModalOptions, EModalActions } from '../../constants';
import { StyledOptionsContainer, StyledOption } from './styles';

interface IStakingButtonOptionsProps {
  disabled: boolean;
  executeAction: (action: EModalActions) => void;
  toggleOptions: () => void;
  toggleModal: (modal: EModalOptions) => void;
}

export const StakingButtonOptions: React.FC<IStakingButtonOptionsProps> = ({
  disabled,
  executeAction,
  toggleOptions,
  toggleModal,
}) => {
  const {
    eraStatus: { electionInProgress },
    stakingAccountInfo: {
      amountUnbonding,
      amountAvailableToWithdraw,
      isController,
      isStash,
      nominations,
    },
  } = useContext(StakingContext);

  const optionsRef = useOutsideClick(() => toggleOptions());

  const isElectionInProgress = electionInProgress === 'Open';
  const isRebondDisabled = !!amountUnbonding?.isZero();
  const isWithdrawDisabled = !!amountAvailableToWithdraw?.isZero();

  const handleAction = (action: EModalActions, isDisabled: boolean = false) => {
    if (disabled || isDisabled) {
      return;
    }
    toggleOptions();
    executeAction(action);
  };

  const handleModalOpen = (
    modal: EModalOptions,
    isDisabled: boolean = false,
  ) => {
    if (disabled || isDisabled) {
      return;
    }
    toggleOptions();
    toggleModal(modal);
  };

  return (
    <StyledOptionsContainer ref={optionsRef}>
      <StyledOption
        onClick={() =>
          handleModalOpen(
            EModalOptions.CHANGE_NOMINATIONS,
            isElectionInProgress || !isController,
          )
        }
        $disabled={disabled || isElectionInProgress || !isController}
      >
        {nominations.length > 0
          ? EModalOptions.CHANGE_NOMINATIONS
          : 'Set Nominations'}
      </StyledOption>
      <StyledOption
        onClick={() =>
          handleModalOpen(
            EModalOptions.CHANGE_CONTROLLER,
            isElectionInProgress || !isStash,
          )
        }
        $disabled={disabled || isElectionInProgress || !isStash}
      >
        {EModalOptions.CHANGE_CONTROLLER}
      </StyledOption>
      <StyledOption
        onClick={() =>
          handleModalOpen(
            EModalOptions.CHANGE_DESTINATION,
            isElectionInProgress || !isController,
          )
        }
        $disabled={disabled || isElectionInProgress || !isController}
      >
        {EModalOptions.CHANGE_DESTINATION}
      </StyledOption>
      <StyledOption
        onClick={() =>
          handleAction(
            EModalActions.CHILL,
            isElectionInProgress || !isController,
          )
        }
        $disabled={disabled || isElectionInProgress || !isController}
      >
        Remove Nominations
      </StyledOption>
      <StyledOption
        onClick={() =>
          handleModalOpen(
            EModalOptions.UNBOND,
            isElectionInProgress || !isController,
          )
        }
        $disabled={disabled || isElectionInProgress || !isController}
      >
        {EModalOptions.UNBOND}
      </StyledOption>
      <StyledOption
        onClick={() =>
          handleModalOpen(
            EModalOptions.REBOND,
            disabled || isRebondDisabled || !isController,
          )
        }
        $disabled={
          disabled || isRebondDisabled || isElectionInProgress || !isController
        }
      >
        {EModalOptions.REBOND}
      </StyledOption>
      <StyledOption
        onClick={() =>
          handleAction(
            EModalActions.WITHDRAW,
            Boolean(
              disabled ||
                isWithdrawDisabled ||
                isElectionInProgress ||
                !isController,
            ),
          )
        }
        $disabled={
          disabled ||
          isWithdrawDisabled ||
          isElectionInProgress ||
          !isController
        }
      >
        Withdraw Unbonded
      </StyledOption>
    </StyledOptionsContainer>
  );
};
