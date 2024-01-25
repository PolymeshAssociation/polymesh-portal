import { useFormContext } from 'react-hook-form';
import { formatBalance } from '~/helpers/formatters';
import { Text } from '~/components/UiKit';
import { IFieldValues } from '../../constants';
import {
  InputWrapper,
  StyledInput,
  StyledError,
  StyledWarning,
} from '../../styles';
import { UseMaxButton, StyledAvailableBalance } from './styles';

interface IAmountInputProps {
  balanceLabel: string;
  balance: number;
  isUnbond?: boolean;
  withAmountValidation?: boolean;
}

export const AmountInput: React.FC<IAmountInputProps> = ({
  balanceLabel,
  balance,
  isUnbond = false,
  withAmountValidation = false,
}) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<IFieldValues>();

  const currentAmount = watch('amount');

  const handleUseMax = () => {
    setValue('amount', balance, { shouldValidate: true });
  };

  return (
    <div>
      <Text size="medium" bold marginBottom={3}>
        POLYX Amount to {isUnbond ? 'Unbond' : 'Bond'}
      </Text>
      <InputWrapper>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <StyledInput placeholder="Enter Amount" {...register('amount')} />
        <UseMaxButton onClick={handleUseMax}>Use max</UseMaxButton>
      </InputWrapper>
      <StyledAvailableBalance>
        <Text>{balanceLabel}</Text>
        <Text>{formatBalance(balance)} POLYX</Text>
      </StyledAvailableBalance>
      {errors.amount && <StyledError>{errors.amount.message}</StyledError>}
      {withAmountValidation &&
        currentAmount > 0 &&
        Number(currentAmount) === balance && (
          <StyledWarning>
            The specified value may not allow enough funds to pay transaction
            fees.
          </StyledWarning>
        )}
    </div>
  );
};
