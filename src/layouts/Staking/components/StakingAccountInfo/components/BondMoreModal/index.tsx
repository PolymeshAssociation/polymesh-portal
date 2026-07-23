import { FormProvider } from 'react-hook-form';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { useContext, useEffect, useState } from 'react';
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
import { PolymeshContext } from '~/context/PolymeshContext';

interface IBondMoreModalProps {
  executeAction: (action: EModalActions, args: TStakeArgs) => void;
  handleClose: () => void;
}

export const BondMoreModal: React.FC<IBondMoreModalProps> = ({
  executeAction,
  handleClose,
}) => {
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);
  const {
    selectedAccount,
    selectedAccountBalance: { free },
  } = useContext(AccountContext);
  const freeBalance = Number(free);

  // The SDK's free balance is the spendable balance (it already excludes the
  // existential deposit and any frozen funds), but the transaction fee is also
  // paid from it, so the max amount that can be bonded is the free balance
  // minus the estimated fee.
  const [maxAvailablePolyx, setMaxAvailablePolyx] =
    useState<number>(freeBalance);

  useEffect(() => {
    if (!polkadotApi || !selectedAccount || !freeBalance) {
      setMaxAvailablePolyx(freeBalance);
      return undefined;
    }

    let isMounted = true;

    const calculateMaxAvailable = async () => {
      try {
        const rawFree = new BigNumber(freeBalance).shiftedBy(6).toFixed(0);
        const { partialFee } = await polkadotApi.tx.staking
          .bondExtra(rawFree)
          .paymentInfo(selectedAccount);
        const fee = new BigNumber(partialFee.toString()).shiftedBy(-6);
        const max = BigNumber.max(
          new BigNumber(freeBalance).minus(fee),
          new BigNumber(0),
        )
          .decimalPlaces(6, BigNumber.ROUND_DOWN)
          .toNumber();
        if (isMounted) {
          setMaxAvailablePolyx(max);
        }
      } catch (error) {
        // If fee estimation fails, fall back to the full free balance
        if (isMounted) {
          setMaxAvailablePolyx(freeBalance);
        }
      }
    };

    calculateMaxAvailable();

    return () => {
      isMounted = false;
    };
  }, [polkadotApi, selectedAccount, freeBalance]);

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
        balanceLabel="Available to bond, after fee"
        balance={maxAvailablePolyx}
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
