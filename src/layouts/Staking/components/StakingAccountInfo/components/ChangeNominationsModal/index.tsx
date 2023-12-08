import { FormProvider } from 'react-hook-form';
import { Button } from '~/components/UiKit';
import {
  EModalActions,
  EModalOptions,
  IStakeForm,
  TStakeArgs,
} from '../../constants';
import { useModalForm } from '../ModalForm/hooks';
import { ButtonContainer, OperatorSelect } from '../ModalForm';
import { NOMINATIONS_MAX_LENGTH } from '../ModalForm/constants';

interface IChangeNominationsModalProps {
  currentNominations: string[];
  executeAction: (action: EModalActions, args: TStakeArgs) => void;
  handleClose: () => void;
}

export const ChangeNominationsModal: React.FC<IChangeNominationsModalProps> = ({
  currentNominations,
  executeAction,
  handleClose,
}) => {
  const formMethods = useModalForm(EModalOptions.CHANGE_NOMINATIONS);

  const onSubmit = (data: Pick<IStakeForm, 'nominators'>) => {
    executeAction(EModalActions.NOMINATE, data.nominators);
  };

  const nominators = formMethods.watch('nominators');

  const isSubmitDisabled =
    !nominators ||
    !nominators.length ||
    nominators?.length > NOMINATIONS_MAX_LENGTH ||
    (nominators.every((operator) => currentNominations.includes(operator)) &&
      currentNominations.every((operator) => nominators.includes(operator)));

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <OperatorSelect currentNominations={currentNominations} />
      <ButtonContainer>
        <Button variant="modalSecondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          disabled={isSubmitDisabled}
          onClick={formMethods.handleSubmit(onSubmit)}
        >
          Set Nominations
        </Button>
      </ButtonContainer>
    </FormProvider>
  );
};
