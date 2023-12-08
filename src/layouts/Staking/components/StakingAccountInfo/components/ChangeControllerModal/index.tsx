import { FormProvider } from 'react-hook-form';
import { Button } from '~/components/UiKit';
import {
  EModalActions,
  EModalOptions,
  TStakeArgs,
  IStakeForm,
} from '../../constants';
import { useModalForm } from '../ModalForm/hooks';
import { AccountsDropdown, ButtonContainer } from '../ModalForm';

interface IChangeControllerModalProps {
  selectedController: string;
  executeAction: (action: EModalActions, args: TStakeArgs) => void;
  handleClose: () => void;
}

export const ChangeControllerModal: React.FC<IChangeControllerModalProps> = ({
  selectedController,
  executeAction,
  handleClose,
}) => {
  const formMethods = useModalForm(EModalOptions.CHANGE_CONTROLLER);

  const onSubmit = (data: Pick<IStakeForm, 'controller'>) => {
    if (data.controller === selectedController) return;
    executeAction(EModalActions.SET_CONTROLLER, data.controller);
  };

  const controller = formMethods.watch('controller');

  const isSubmitDisabled =
    !formMethods.formState.touchedFields?.controller ||
    Boolean(Object.keys(formMethods.formState.errors).length) ||
    !controller ||
    selectedController === controller;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <AccountsDropdown
        header="Controller Address"
        currentAddress={selectedController}
        isController
      />
      <ButtonContainer>
        <Button variant="modalSecondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          disabled={isSubmitDisabled}
          onClick={formMethods.handleSubmit(onSubmit)}
        >
          Set Controller
        </Button>
      </ButtonContainer>
    </FormProvider>
  );
};
