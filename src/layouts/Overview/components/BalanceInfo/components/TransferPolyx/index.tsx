import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
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
import { notifyError } from '~/helpers/notifications';
import { formatBalance } from '~/helpers/formatters';
import { TRANSFER_INPUTS, FORM_CONFIG } from './constants';

export const TransferPolyx: React.FC<{ toggleModal: () => void }> = ({
  toggleModal,
}) => {
  const {
    availableBalance,
    transferPolyx,
    transactionInProcess,
    transactionError,
  } = useTransferPolyx();
  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
    setValue,
  } = useForm(FORM_CONFIG);

  const handleUseMax = () => {
    setValue('amount', availableBalance);
  };

  const onSubmit = (data) => {
    transferPolyx(data);
    reset();
    toggleModal();
  };

  useEffect(() => {
    if (!transactionError) return;

    notifyError(transactionError);
  }, [transactionError]);

  return (
    <Modal handleClose={toggleModal}>
      <StyledModalWrapper>
        <Heading type="h4">Send POLYX</Heading>
        {TRANSFER_INPUTS.map(
          ({ label, id, placeholder, withCaption, withButton }) => (
            <div key={id}>
              <StyledLabel htmlFor={id}>
                {label}
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
