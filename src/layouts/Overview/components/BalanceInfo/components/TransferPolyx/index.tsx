import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useTransferPolyx } from '~/hooks/polymesh';
import { Modal } from '~/components';
import { Heading, Button } from '~/components/UiKit';
import {
  StyledModalWrapper,
  StyledButtonWrapper,
  StyledInputWrapper,
  StyledInput,
  StyledLabel,
  StyledCaption,
  StyledMaxButton,
  StyledErrorMessage,
} from './styles';
import { formatBalance } from '~/helpers/formatters';
import { TRANSFER_INPUTS, createFormConfig } from './constants';
import { ITransfer } from '~/hooks/polymesh/useTransferPolyx';
import { useWindowWidth } from '~/hooks/utility';

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
  const { isMobile } = useWindowWidth();

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
            <StyledInputWrapper key={id}>
              <StyledLabel htmlFor={id}>{label}</StyledLabel>
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
              {errors[id] ? (
                <StyledErrorMessage>
                  {(errors[id]?.message as string) || ''}
                </StyledErrorMessage>
              ) : null}
            </StyledInputWrapper>
          ),
        )}
        <StyledButtonWrapper>
          {!isMobile && (
            <Button
              variant="modalSecondary"
              onClick={toggleModal}
              disabled={transactionInProcess}
            >
              Cancel
            </Button>
          )}
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
