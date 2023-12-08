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
import { AmountInput, ButtonContainer } from '../ModalForm';

interface IRebondModalProps {
  amountUnbonding: number;
  executeAction: (action: EModalActions, args: TStakeArgs) => void;
  handleClose: () => void;
}

export const RebondModal: React.FC<IRebondModalProps> = ({
  amountUnbonding,
  executeAction,
  handleClose,
}) => {
  const formMethods = useModalForm(EModalOptions.BOND_MORE, amountUnbonding);

  const onSubmit = (data: Pick<IStakeForm, 'amount'>) => {
    executeAction(EModalActions.REBOND, {
      value: new BigNumber(data.amount as number).shiftedBy(6).toNumber(),
    });
  };
  const amount = formMethods.watch('amount');
  const isSubmitDisabled =
    Boolean(Object.keys(formMethods.formState.errors).length) || !amount;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <AmountInput balanceLabel="Unbonding" balance={amountUnbonding} />
      <ButtonContainer>
        <Button variant="modalSecondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          disabled={isSubmitDisabled}
          onClick={formMethods.handleSubmit(onSubmit)}
        >
          Rebond
        </Button>
      </ButtonContainer>
    </FormProvider>
  );
};
