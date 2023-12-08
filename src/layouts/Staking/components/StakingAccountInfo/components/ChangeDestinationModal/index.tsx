import { FormProvider } from 'react-hook-form';
import { Button } from '~/components/UiKit';
import {
  PAYMENT_DESTINATION,
  EModalActions,
  EModalOptions,
  IStakeForm,
  TStakeArgs,
} from '../../constants';
import { useModalForm } from '../ModalForm/hooks';
import {
  AccountsDropdown,
  DestinationDropdown,
  ButtonContainer,
} from '../ModalForm';

interface IChangeDestinationModalProps {
  selectedDestination: keyof typeof PAYMENT_DESTINATION;
  rewardAddress: string;
  executeAction: (action: EModalActions, args: TStakeArgs) => void;
  handleClose: () => void;
}

export const ChangeDestinationModal: React.FC<IChangeDestinationModalProps> = ({
  selectedDestination,
  rewardAddress,
  executeAction,
  handleClose,
}) => {
  const formMethods = useModalForm(EModalOptions.CHANGE_DESTINATION);

  const onSubmit = (
    data: Pick<IStakeForm, 'destination' | 'specifiedAccount'>,
  ) => {
    const args =
      data.destination === PAYMENT_DESTINATION.Account
        ? { Account: data.specifiedAccount as string }
        : data.destination;
    executeAction(EModalActions.SET_PAYEE, args);
  };

  const destination = formMethods.watch('destination');
  const shouldSpecifyAccount = destination === PAYMENT_DESTINATION.Account;

  const isSubmitDisabled =
    Boolean(Object.keys(formMethods.formState.errors).length) ||
    !destination ||
    (!shouldSpecifyAccount && selectedDestination === destination) ||
    (shouldSpecifyAccount &&
      (!formMethods.watch('specifiedAccount') ||
        rewardAddress === formMethods.watch('specifiedAccount')));

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <DestinationDropdown currentDestination={selectedDestination} />
      {shouldSpecifyAccount && (
        <AccountsDropdown
          header="Destination Address"
          currentAddress={rewardAddress}
          isController={false}
        />
      )}
      <ButtonContainer>
        <Button variant="modalSecondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          disabled={isSubmitDisabled}
          onClick={formMethods.handleSubmit(onSubmit)}
        >
          Set Destination
        </Button>
      </ButtonContainer>
    </FormProvider>
  );
};
