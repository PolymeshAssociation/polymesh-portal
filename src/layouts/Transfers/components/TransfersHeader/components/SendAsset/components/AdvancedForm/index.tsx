/* eslint-disable react/jsx-props-no-spreading */
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  UnsubCallback,
  Venue,
  VenueDetails,
} from '@polymeshassociation/polymesh-sdk/types';
import { LegSelect, Icon } from '~/components';
import { Button, DropdownSelect, Text } from '~/components/UiKit';
import { InstructionsContext } from '~/context/InstructionsContext';
import {
  StyledButtonsWrapper,
  StyledInput,
  StyledLabel,
} from '../../../styles';
import {
  FlexInputWrapper,
  InputWrapper,
  StyledAddButton,
  StyledErrorMessage,
} from '../../styles';
import { IAdvancedFieldValues, ADVANCED_FORM_CONFIG } from '../config';
import { ISelectedLeg } from '~/components/LegSelect/types';
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';
import {
  createAdvancedInstructionParams,
  updateLegsOnSelect,
} from '../helpers';

interface IAdvancedFormProps {
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}

interface IVenueWithDetails {
  venue: Venue;
  details: VenueDetails;
}

export const AdvancedForm: React.FC<IAdvancedFormProps> = ({ toggleModal }) => {
  const { createdVenues, instructionsLoading, refreshInstructions } =
    useContext(InstructionsContext);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<IAdvancedFieldValues>(ADVANCED_FORM_CONFIG);
  const { handleStatusChange } = useTransactionStatus();
  const [venues, setVenues] = useState<IVenueWithDetails[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [legIndexes, setLegIndexes] = useState<number[]>([0]);
  const [selectedLegs, setSelectedLegs] = useState<ISelectedLeg[]>([]);

  useEffect(() => {
    if (instructionsLoading) return;

    (async () => {
      const venuesWithDetails = await Promise.all(
        createdVenues.map(async (venue) => ({
          venue,
          details: await venue.details(),
        })),
      );

      setVenues(venuesWithDetails);
    })();
  }, [createdVenues, instructionsLoading]);

  const handleVenueSelect = (idWithType: string) => {
    setValue('venue', idWithType, { shouldValidate: true });

    if (!idWithType) return;

    const id = idWithType.split('/')[0].trim();
    const venueToSelect = createdVenues.find((venue) => id === venue.toHuman());
    if (venueToSelect) {
      setSelectedVenue(venueToSelect);
    }
  };

  const handleAssetSelect = (item: ISelectedLeg) => {
    if (!selectedLegs.some(({ index }) => index === item.index)) {
      setSelectedLegs((prev) => [...prev, item]);
    } else {
      const updatedAssets = updateLegsOnSelect(item, selectedLegs);

      setSelectedLegs(updatedAssets);
    }
  };

  const handleAddLegField = () => {
    setLegIndexes((prev) => [...prev, prev[prev.length - 1] + 1]);
  };

  const handleDeleteLegField = (index: number) => {
    setLegIndexes((prev) => prev.filter((prevIndex) => prevIndex !== index));

    const updatedAssets = selectedLegs.filter(
      (selectedAsset) => selectedAsset.index !== index,
    );
    setSelectedLegs(updatedAssets);
  };

  const handleResetAssetAmount = (index: number) => {
    setSelectedLegs((prev) =>
      prev.map((selectedLeg) => {
        if (selectedLeg.index !== index) return selectedLeg;

        return { ...selectedLeg, amount: 0 };
      }),
    );
  };

  const onSubmit = async (formData: IAdvancedFieldValues) => {
    if (!selectedVenue) return;
    let unsubCb: UnsubCallback | undefined;
    reset();
    toggleModal();
    try {
      const tx = await selectedVenue.addInstruction(
        createAdvancedInstructionParams({ selectedLegs, formData }),
      );
      unsubCb = tx.onStatusChange(handleStatusChange);
      await tx.run();
      refreshInstructions();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      if (unsubCb) {
        unsubCb();
      }
    }
  };

  const venueSelectOptions = venues.map(
    ({ venue, details }) => `${venue.toHuman()} / ${details.type}`,
  );
  const isDataValid =
    isValid &&
    !!selectedLegs.length &&
    selectedLegs.every(({ amount }) => amount > 0);

  return (
    <>
      <InputWrapper marginBotom={24}>
        <DropdownSelect
          label="Venue"
          placeholder="Select venue"
          onChange={handleVenueSelect}
          options={venueSelectOptions}
          error={errors?.venue?.message}
        />
      </InputWrapper>
      <FlexInputWrapper marginBotom={24}>
        <InputWrapper>
          <StyledLabel htmlFor="valueDate">Value Date (Optional)</StyledLabel>
          <StyledInput
            id="valueDate"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            {...register('valueDate')}
          />
        </InputWrapper>
        <InputWrapper>
          <StyledLabel htmlFor="tradeDate">Trade Date (Optional)</StyledLabel>
          <StyledInput
            id="tradeDate"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            {...register('tradeDate')}
          />
        </InputWrapper>
      </FlexInputWrapper>
      <InputWrapper marginBotom={36}>
        <StyledLabel htmlFor="memo">Memo (Optional)</StyledLabel>
        <StyledInput id="memo" placeholder="Enter memo" {...register('memo')} />
        {!!errors?.memo?.message && (
          <StyledErrorMessage>
            {errors?.memo?.message as string}
          </StyledErrorMessage>
        )}
      </InputWrapper>
      <Text bold size="large" marginBottom={24}>
        Leg Details
      </Text>

      {legIndexes.map((index) => (
        <LegSelect
          key={index}
          index={index}
          handleAdd={handleAssetSelect}
          handleDelete={handleDeleteLegField}
          handleResetAmount={handleResetAssetAmount}
          selectedLegs={selectedLegs}
        />
      ))}

      <StyledAddButton onClick={handleAddLegField}>
        <Icon name="Plus" />
        Add Leg
      </StyledAddButton>
      <StyledButtonsWrapper>
        <Button variant="modalSecondary" onClick={toggleModal}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          disabled={!isDataValid}
          onClick={handleSubmit(onSubmit)}
        >
          Send
        </Button>
      </StyledButtonsWrapper>
    </>
  );
};
