import { FormProvider } from 'react-hook-form';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { Button } from '~/components/UiKit';
import {
  EModalActions,
  EModalOptions,
  IStakeForm,
  TStakeArgs,
} from '../../constants';
import { useModalForm } from '../ModalForm/hooks';
import { AmountInput, ButtonContainer, DurationInfo } from '../ModalForm';

interface IUnbondModalProps {
  totalBonded: number;
  executeAction: (action: EModalActions, args: TStakeArgs) => void;
  handleClose: () => void;
}

export const UnbondModal: React.FC<IUnbondModalProps> = ({
  totalBonded,
  executeAction,
  handleClose,
}) => {
  const formMethods = useModalForm(EModalOptions.UNBOND, totalBonded);

  const onSubmit = (data: Pick<IStakeForm, 'amount'>) => {
    executeAction(EModalActions.UNBOND, {
      value: new BigNumber(data.amount as number).shiftedBy(6).toNumber(),
    });
  };

  const amount = formMethods.watch('amount');
  const isSubmitDisabled =
    Boolean(Object.keys(formMethods.formState.errors).length) || !amount;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <AmountInput balanceLabel="Bonded" balance={totalBonded} />
      <DurationInfo label="Unbonding duration" tooltip />
      <ButtonContainer>
        <Button variant="modalSecondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          disabled={isSubmitDisabled}
          onClick={formMethods.handleSubmit(onSubmit)}
        >
          Unbond
        </Button>
      </ButtonContainer>
    </FormProvider>
  );
};
