import { FormProvider } from 'react-hook-form';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { useContext, useEffect, useRef, useState } from 'react';
import { Button, Text } from '~/components/UiKit';
import {
  PAYMENT_DESTINATION,
  EModalActions,
  EModalOptions,
  IStakeForm,
  TStakeArgs,
  TDestination,
} from '../../constants';
import { useModalForm } from '../ModalForm/hooks';
import { NOMINATIONS_MAX_LENGTH } from '../ModalForm/constants';
import {
  AccountsDropdown,
  AmountInput,
  DestinationDropdown,
  ButtonContainer,
  DurationInfo,
  OperatorSelect,
} from '../ModalForm';
import { StyledExpansionToggle, StyledSelect, StyledAutoStake } from './styles';
import { Icon } from '~/components';
import { AccountContext } from '~/context/AccountContext';

interface IStakeModalProps {
  executeAction: (action: EModalActions, args: TStakeArgs) => void;
  handleClose: () => void;
}

export const StakeModal: React.FC<IStakeModalProps> = ({
  executeAction,
  handleClose,
}) => {
  const {
    selectedAccount,
    selectedAccountBalance: { free },
  } = useContext(AccountContext);
  const availableBalance = Number(free);

  const [expanded, setExpanded] = useState(false);
  const expandedRef = useRef(false);

  const formMethods = useModalForm(EModalOptions.STAKE, availableBalance);
  const { watch, setValue, trigger, handleSubmit, formState } = formMethods;
  const controller = watch('controller');
  const destination = watch('destination');
  const amount = watch('amount');
  const nominators = watch('nominators');
  const shouldSpecifyAccount = destination === PAYMENT_DESTINATION.Account;

  const toggleAdvancedExpanded = () => setExpanded((prev) => !prev);

  const onSubmit = (data: IStakeForm) => {
    executeAction(EModalActions.BOND, {
      controller: data.controller,
      amount: new BigNumber(data.amount).shiftedBy(6).toNumber(),
      nominators: data.nominators,
      payee:
        data.destination === PAYMENT_DESTINATION.Account
          ? { Account: data.specifiedAccount as string }
          : (data.destination as TDestination),
    });
  };

  useEffect(() => {
    if (controller === undefined) {
      setValue('controller', selectedAccount);
    }
  }, [controller, expanded, selectedAccount, setValue]);

  useEffect(() => {
    if (destination === undefined) {
      setValue('destination', PAYMENT_DESTINATION.Staked);
    }
  }, [destination, expanded, setValue]);

  useEffect(() => {
    if (expandedRef.current !== expanded && !expanded) {
      setValue('controller', selectedAccount);
      trigger('controller');
      if (
        destination === PAYMENT_DESTINATION.Controller ||
        destination === PAYMENT_DESTINATION.Account
      ) {
        setValue('destination', PAYMENT_DESTINATION.Stash);
      }
    }
    expandedRef.current = expanded;
  }, [destination, expanded, selectedAccount, setValue, trigger]);

  const handleAutoStakeToggle = () => {
    if (destination === PAYMENT_DESTINATION.Staked) {
      setValue('destination', PAYMENT_DESTINATION.Stash);
    } else {
      setValue('destination', PAYMENT_DESTINATION.Staked);
    }
  };

  const isSubmitDisabled =
    Boolean(Object.keys(formState.errors).length) ||
    !controller ||
    !amount ||
    !destination ||
    !nominators ||
    !nominators.length ||
    nominators.length > NOMINATIONS_MAX_LENGTH ||
    (shouldSpecifyAccount && !watch('specifiedAccount'));

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <AmountInput
        balanceLabel="Available balance"
        balance={availableBalance}
        withAmountValidation
      />
      <OperatorSelect />
      <StyledAutoStake>
        <Text>Automatically stake rewards</Text>
        {destination && (
          <StyledSelect
            $isSelected={destination === PAYMENT_DESTINATION.Staked}
            onClick={handleAutoStakeToggle}
          >
            <Icon name="Check" size="16px" />
          </StyledSelect>
        )}
      </StyledAutoStake>
      <StyledExpansionToggle
        $expanded={expanded}
        onClick={toggleAdvancedExpanded}
      >
        <Text>{expanded ? 'Hide' : 'Show'} advanced options</Text>
        <Icon name="ExpandIcon" className="expand-icon" size="18px" />
      </StyledExpansionToggle>
      {expanded && (
        <>
          <AccountsDropdown header="Enter a Controller Address" isController />
          <DestinationDropdown />
          {shouldSpecifyAccount && (
            <AccountsDropdown header="Destination Address" />
          )}
        </>
      )}
      <DurationInfo label="Unbonding Period" tooltip />
      <ButtonContainer>
        <Button variant="modalSecondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          disabled={isSubmitDisabled}
          onClick={handleSubmit(onSubmit)}
        >
          Stake
        </Button>
      </ButtonContainer>
    </FormProvider>
  );
};
