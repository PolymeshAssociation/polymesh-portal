/* eslint-disable react/jsx-props-no-spreading */
import { useForm } from 'react-hook-form';
import { VenueType } from '@polymeshassociation/polymesh-sdk/types';
import { useContext } from 'react';
import { Modal } from '~/components';
import { Heading, Button, DropdownSelect } from '~/components/UiKit';
import { StyledInput, StyledLabel, StyledButtonsWrapper } from '../styles';
import { InputWrapper, StyledErrorMessage } from './styles';
import { FORM_CONFIG, IFieldValues } from './config';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { InstructionsContext } from '~/context/InstructionsContext';
import { useWindowWidth } from '~/hooks/utility';

interface ICreateVenueProps {
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}

export const CreateVenue: React.FC<ICreateVenueProps> = ({ toggleModal }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<IFieldValues>(FORM_CONFIG);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { refreshInstructions } = useContext(InstructionsContext);
  const { executeTransaction, isTransactionInProgress } =
    useTransactionStatusContext();
  const { isMobile } = useWindowWidth();

  const onSubmit = async ({ description, type }: IFieldValues) => {
    if (!sdk) return;
    try {
      await executeTransaction(
        sdk.settlements.createVenue({ description, type }),
        {
          onTransactionRunning: () => {
            reset();
            toggleModal();
          },
          onSuccess: async () => {
            refreshInstructions();
          },
        },
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  return (
    <Modal handleClose={toggleModal} disableOverflow>
      <Heading type="h4" marginBottom={32}>
        Create New Venue
      </Heading>
      <InputWrapper $marginBottom={24}>
        <StyledLabel htmlFor="description">Description</StyledLabel>
        <StyledInput id="description" {...register('description')} />
        {!!errors?.description?.message && (
          <StyledErrorMessage>
            {errors?.description?.message as string}
          </StyledErrorMessage>
        )}
      </InputWrapper>
      <DropdownSelect
        label="Type"
        placeholder="Select type"
        options={Object.values(VenueType)}
        onChange={(value) =>
          setValue('type', value as VenueType, { shouldValidate: true })
        }
        error={errors?.type?.message}
      />
      <StyledButtonsWrapper>
        {!isMobile && (
          <Button variant="modalSecondary" onClick={toggleModal}>
            Cancel
          </Button>
        )}
        <Button
          variant="modalPrimary"
          disabled={!isValid || isTransactionInProgress}
          onClick={handleSubmit(onSubmit)}
        >
          Confirm
        </Button>
      </StyledButtonsWrapper>
    </Modal>
  );
};
