import { FormProvider } from 'react-hook-form';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { useContext } from 'react';
import { Button } from '~/components/UiKit';
import {
  EModalActions,
  EModalOptions,
  IStakeForm,
  TStakeArgs,
} from '../../constants';
import { useModalForm } from '../ModalForm/hooks';
import { AmountInput, ButtonContainer } from '../ModalForm';
import { AccountContext } from '~/context/AccountContext';

interface IBondMoreModalProps {
  executeAction: (action: EModalActions, args: TStakeArgs) => void;
  handleClose: () => void;
}

export const BondMoreModal: React.FC<IBondMoreModalProps> = ({
  executeAction,
  handleClose,
}) => {
  const {
    selectedAccountBalance: { free },
  } = useContext(AccountContext);
  const maxAvailablePolyx = Number(free);

  const formMethods = useModalForm(EModalOptions.BOND_MORE, maxAvailablePolyx);

  const onSubmit = (data: Pick<IStakeForm, 'amount'>) => {
    executeAction(EModalActions.BOND_EXTRA, {
      max_additional: new BigNumber(data.amount as number)
        .shiftedBy(6)
        .toNumber(),
    });
  };

  const amount = formMethods.watch('amount');

  const isSubmitDisabled =
    Boolean(Object.keys(formMethods.formState.errors).length) || !amount;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <AmountInput
        balanceLabel="Available balance"
        balance={maxAvailablePolyx}
        withAmountValidation
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
          Bond More
        </Button>
      </ButtonContainer>
    </FormProvider>
  );
};
