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
import { TSelectedLeg } from '~/components/LegSelect/types';
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';
import { MAX_NFTS_PER_LEG } from '~/components/AssetForm/constants';
import { createAdvancedInstructionParams } from '../helpers';
import { useWindowWidth } from '~/hooks/utility';

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
  const [selectedLegs, setSelectedLegs] = useState<TSelectedLeg[]>([]);
  const { isMobile } = useWindowWidth();

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

  const handleAssetSelect = (index: number, item: TSelectedLeg) => {
    setSelectedLegs((prev) => {
      const newLegs = [...prev];
      newLegs[index] = item;
      return newLegs;
    });
  };

  const handleAddLegField = () => {
    setLegIndexes((prev) => [...prev, prev[prev.length - 1] + 1]);
  };

  const handleDeleteLegField = (index: number) => {
    setLegIndexes((prev) => prev.filter((prevIndex) => prevIndex !== index));

    const updatedAssets = selectedLegs.filter(
      (_selectedAsset, itemIndex) => itemIndex !== index,
    );
    setSelectedLegs(updatedAssets);
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
      unsubCb = tx.onStatusChange((transaction) =>
        handleStatusChange(transaction),
      );
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
    !selectedLegs.some((asset) => {
      if ('amount' in asset) {
        return asset.amount.toNumber() <= 0;
      }
      return !asset.nfts?.length || asset.nfts?.length > MAX_NFTS_PER_LEG;
    });

  return (
    <>
      <InputWrapper $marginBottom={24}>
        <DropdownSelect
          label="Venue"
          placeholder="Select venue"
          onChange={handleVenueSelect}
          options={venueSelectOptions}
          error={errors?.venue?.message}
        />
      </InputWrapper>
      <FlexInputWrapper $marginBottom={24}>
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
      <InputWrapper $marginBottom={36}>
        <StyledLabel htmlFor="memo">
          Memo (Optional - this will be public)
        </StyledLabel>
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
          selectedLegs={selectedLegs}
        />
      ))}

      <StyledAddButton onClick={handleAddLegField}>
        <Icon name="Plus" />
        Add Leg
      </StyledAddButton>
      <StyledButtonsWrapper>
        {!isMobile && (
          <Button variant="modalSecondary" onClick={toggleModal}>
            Cancel
          </Button>
        )}
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
