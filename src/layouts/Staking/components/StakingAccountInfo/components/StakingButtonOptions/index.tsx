import { useContext } from 'react';
import { StakingContext } from '~/context/StakingContext';
import { useOutsideClick } from '~/hooks/utility';
import { EModalActions, EModalOptions } from '../../constants';
import { StyledOption, StyledOptionsContainer } from './styles';

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
    stakingAccountInfo: {
      amountUnbonding,
      amountAvailableToWithdraw,
      controllerAddress,
      isController,
      isStash,
      nominations,
      stashAddress,
    },
  } = useContext(StakingContext);

  const optionsRef = useOutsideClick(() => toggleOptions());

  const isRebondDisabled = !!amountUnbonding?.isZero();
  const isWithdrawDisabled = !!amountAvailableToWithdraw?.isZero();
  const canResetController =
    isStash &&
    Boolean(controllerAddress) &&
    Boolean(stashAddress) &&
    controllerAddress !== stashAddress;

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
          handleModalOpen(EModalOptions.CHANGE_NOMINATIONS, !isController)
        }
        $disabled={disabled || !isController}
      >
        {nominations.length > 0
          ? EModalOptions.CHANGE_NOMINATIONS
          : 'Set Nominations'}
      </StyledOption>
      {canResetController && (
        <StyledOption
          onClick={() => handleModalOpen(EModalOptions.CHANGE_CONTROLLER)}
          $disabled={disabled}
        >
          {EModalOptions.CHANGE_CONTROLLER}
        </StyledOption>
      )}
      <StyledOption
        onClick={() =>
          handleModalOpen(EModalOptions.CHANGE_DESTINATION, !isController)
        }
        $disabled={disabled || !isController}
      >
        {EModalOptions.CHANGE_DESTINATION}
      </StyledOption>
      <StyledOption
        onClick={() => handleAction(EModalActions.CHILL, !isController)}
        $disabled={disabled || !isController}
      >
        Remove Nominations
      </StyledOption>
      <StyledOption
        onClick={() => handleModalOpen(EModalOptions.UNBOND, !isController)}
        $disabled={disabled || !isController}
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
        $disabled={disabled || isRebondDisabled || !isController}
      >
        {EModalOptions.REBOND}
      </StyledOption>
      <StyledOption
        onClick={() =>
          handleAction(
            EModalActions.WITHDRAW,
            Boolean(disabled || isWithdrawDisabled || !isController),
          )
        }
        $disabled={disabled || isWithdrawDisabled || !isController}
      >
        Withdraw Unbonded
      </StyledOption>
    </StyledOptionsContainer>
  );
};
