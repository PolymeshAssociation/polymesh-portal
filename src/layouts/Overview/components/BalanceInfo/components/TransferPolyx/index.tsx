import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useTransferPolyx } from '~/hooks/polymesh';
import { Modal } from '~/components';
import { Heading, Button } from '~/components/UiKit';
import {
  StyledModalWrapper,
  StyledButtonWrapper,
  StyledInput,
  StyledLabel,
  StyledCaption,
  StyledMaxButton,
} from './styles';
import { formatBalance } from '~/helpers/formatters';
import { TRANSFER_INPUTS, createFormConfig } from './constants';
import { ITransfer } from '~/hooks/polymesh/useTransferPolyx';

export const TransferPolyx: React.FC<{ toggleModal: () => void }> = ({
  toggleModal,
}) => {
  const {
    availableBalance,
    availableMinusGasFee,
    transferPolyx,
    transactionInProcess,
    selectedAccount,
    checkAddressValidity,
  } = useTransferPolyx();
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    reset,
    setValue,
  } = useForm(
    createFormConfig({
      maxAmount: availableMinusGasFee,
      selectedAccount,
      checkAddressValidity,
    }),
  );

  const handleUseMax = () => {
    setValue('amount', availableMinusGasFee);
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    transferPolyx(data as ITransfer);
    reset();
    toggleModal();
  };

  return (
    <Modal handleClose={toggleModal}>
      <StyledModalWrapper>
        <Heading type="h4">Send POLYX</Heading>
        {TRANSFER_INPUTS.map(
          ({ label, id, placeholder, withCaption, withButton }) => (
            <div key={id}>
              <StyledLabel htmlFor={id}>
                {label}
                {errors[id] ? (
                  <span style={{ color: 'red' }}>
                    {(errors[id]?.message as string) || ''}
                  </span>
                ) : null}
                <StyledInput
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...register(id)}
                  id={id}
                  placeholder={placeholder}
                />
                {withButton && (
                  <StyledMaxButton onClick={handleUseMax}>
                    Use max
                  </StyledMaxButton>
                )}
                {withCaption && (
                  <StyledCaption>
                    Available balance{' '}
                    <span>{formatBalance(availableBalance)} POLYX</span>
                  </StyledCaption>
                )}
              </StyledLabel>
            </div>
          ),
        )}
        <StyledButtonWrapper>
          <Button
            variant="modalSecondary"
            onClick={toggleModal}
            disabled={transactionInProcess}
          >
            Cancel
          </Button>
          <Button
            variant="modalPrimary"
            disabled={!isValid || transactionInProcess}
            onClick={handleSubmit(onSubmit)}
          >
            Send
          </Button>
        </StyledButtonWrapper>
      </StyledModalWrapper>
    </Modal>
  );
};
