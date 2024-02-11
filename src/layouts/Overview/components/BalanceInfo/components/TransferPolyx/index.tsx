import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTransferPolyx } from '~/hooks/polymesh';
import { Icon, Modal } from '~/components';
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
  InputWithButtonWrapper,
  StyledIconWrapper,
} from './styles';
import { formatBalance } from '~/helpers/formatters';
import { TRANSFER_INPUTS, createFormConfig } from './constants';
import { ITransfer } from '~/hooks/polymesh/useTransferPolyx';
import { useWindowWidth } from '~/hooks/utility';

export const TransferPolyx: React.FC<{ toggleModal: () => void }> = ({
  toggleModal,
}) => {
  const {
    transferPolyx,
    transactionInProcess,
    selectedAccount,
    checkAddressValidity,
    maxTransferablePolyx,
    maxTransferablePolyxWithMemo,
  } = useTransferPolyx();
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm(
    createFormConfig({
      maxAmount: maxTransferablePolyx.toNumber(),
      maxAmountWithMemo: maxTransferablePolyxWithMemo.toNumber(),
      selectedAccount,
      checkAddressValidity,
    }),
  );
  const [useMax, setUseMax] = useState(false);

  const memo = watch('memo');
  const memoRef = useRef<string | null>(null);
  const amount = watch('amount');
  const amountRef = useRef<string | null>(null);

  const { isMobile } = useWindowWidth();

  const maxTransferable = useMemo(() => {
    return memo ? maxTransferablePolyxWithMemo : maxTransferablePolyx;
  }, [maxTransferablePolyx, maxTransferablePolyxWithMemo, memo]);

  useEffect(() => {
    if (amount.current === null) {
      amount.current = amount;
      return;
    }
    if (useMax && !maxTransferable.eq(amount) && amountRef.current !== amount) {
      setUseMax(false);
    }
    amountRef.current = amount;
  }, [amount, maxTransferable, useMax]);

  useEffect(() => {
    if (memoRef.current === null) {
      memoRef.current = memo;
      return;
    }
    if ((memoRef.current && !memo) || (!memoRef.current && memo)) {
      trigger('amount');
    }
    memoRef.current = memo;
  }, [memo, trigger]);

  useEffect(() => {
    if (!useMax) {
      return;
    }
    setValue('amount', maxTransferable.toString());

    trigger();
  }, [maxTransferable, setValue, trigger, useMax]);

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
              <InputWithButtonWrapper>
                <StyledInput
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...register(id)}
                  id={id}
                  placeholder={placeholder}
                />
                {withButton && (
                  <StyledMaxButton
                    $maxSet={useMax}
                    disabled={maxTransferable.eq(0)}
                    onClick={() => setUseMax(true)}
                  >
                    {useMax ? (
                      <>
                        <StyledIconWrapper>
                          <Icon name="Check" size="14px" />
                        </StyledIconWrapper>
                        Max set
                      </>
                    ) : (
                      'Use max'
                    )}
                  </StyledMaxButton>
                )}
              </InputWithButtonWrapper>
              {errors[id] ? (
                <StyledErrorMessage>
                  {(errors[id]?.message as string) || ''}
                </StyledErrorMessage>
              ) : null}

              {withCaption && (
                <StyledCaption>
                  Max transferable, after fee{' '}
                  <span>{formatBalance(maxTransferable.toString())} POLYX</span>
                </StyledCaption>
              )}
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
