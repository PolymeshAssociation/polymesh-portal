/* eslint-disable react/jsx-props-no-spreading */
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  GenericPolymeshTransaction,
  Instruction,
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
import { PolymeshContext } from '~/context/PolymeshContext';

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
    api: { sdk },
  } = useContext(PolymeshContext);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<IAdvancedFieldValues>(ADVANCED_FORM_CONFIG);
  const { handleStatusChange } = useTransactionStatus();
  const [removeSelection, setRemoveSelection] = useState<boolean>(false);
  const [venues, setVenues] = useState<IVenueWithDetails[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [legIndexes, setLegIndexes] = useState<number[]>([0]);
  const [selectedLegs, setSelectedLegs] = useState<TSelectedLeg[]>([
    { index: 0 } as TSelectedLeg,
  ]);
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

  const venueSelectOptions = useMemo(() => {
    return selectedVenue
      ? [
          'Clear selection (No Venue)',
          ...venues.map(
            ({ venue, details }) =>
              `${venue.toHuman()} / ${details.description}`,
          ),
        ]
      : venues.map(
          ({ venue, details }) => `${venue.toHuman()} / ${details.description}`,
        );
  }, [venues, selectedVenue]);

  const handleVenueSelect = useCallback(
    (idWithDescription: string | null) => {
      if (
        !idWithDescription ||
        idWithDescription === 'Clear selection (No Venue)'
      ) {
        setRemoveSelection(true);
        setValue('venue', '', { shouldValidate: true });
        setSelectedVenue(null);
        return;
      }
      setRemoveSelection(false);
      setValue('venue', idWithDescription, { shouldValidate: true });

      const id = idWithDescription.split('/')[0].trim();
      const venueToSelect = createdVenues.find(
        (venue) => id === venue.toHuman(),
      );
      if (venueToSelect) {
        setSelectedVenue(venueToSelect);
      }
    },
    [createdVenues, setValue],
  );

  const handleLegUpdate = useCallback((index: number, item: TSelectedLeg) => {
    setSelectedLegs((prev) => {
      const legIndex = prev.findIndex((leg) => leg.index === index);
      if (legIndex !== -1) {
        const updatedLegs = [...prev];
        updatedLegs[legIndex] = item;
        return updatedLegs;
      }
      return [...prev, item];
    });
  }, []);

  const handleAddLegField = useCallback(() => {
    setLegIndexes((prev) => {
      const newLegIndex = prev[prev.length - 1] + 1;
      handleLegUpdate(newLegIndex, { index: newLegIndex } as TSelectedLeg);
      return [...prev, newLegIndex];
    });
  }, [handleLegUpdate]);

  const handleDeleteLegField = useCallback((index: number) => {
    setLegIndexes((prev) => prev.filter((prevIndex) => prevIndex !== index));
    setSelectedLegs((prev) => prev.filter((leg) => leg.index !== index));
  }, []);

  const isDataValid = useMemo(() => {
    return (
      isValid &&
      !!selectedLegs.length &&
      !selectedLegs.some((leg) => {
        const hasRequiredFields = leg.from && leg.to && leg.asset;
        if (!hasRequiredFields) return true;

        if (leg.from.owner.did === leg.to.owner.did) return true;

        if ('amount' in leg) {
          return leg.amount.lte(0);
        }

        return !leg.nfts?.length || leg.nfts.length > MAX_NFTS_PER_LEG;
      })
    );
  }, [isValid, selectedLegs]);

  const onSubmit = useCallback(
    async (formData: IAdvancedFieldValues) => {
      if (!isDataValid || !sdk) return;
      let unsubCb: UnsubCallback | undefined;
      reset();
      toggleModal();
      try {
        let tx: GenericPolymeshTransaction<Instruction[], Instruction>;
        if (!selectedVenue) {
          tx = await sdk.settlements.addInstruction(
            createAdvancedInstructionParams({ selectedLegs, formData }),
          );
        } else {
          tx = await selectedVenue.addInstruction(
            createAdvancedInstructionParams({ selectedLegs, formData }),
          );
        }
        unsubCb = tx.onStatusChange((transaction) =>
          handleStatusChange(transaction),
        );
        await tx.run();
        refreshInstructions();
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        if (unsubCb) unsubCb();
      }
    },
    [
      isDataValid,
      sdk,
      reset,
      toggleModal,
      selectedVenue,
      refreshInstructions,
      selectedLegs,
      handleStatusChange,
    ],
  );

  return (
    <>
      <InputWrapper $marginBottom={24}>
        <DropdownSelect
          label="Venue (Optional)"
          placeholder={
            venueSelectOptions.length > 0
              ? 'Select venue'
              : 'No venue available. Create one to select.'
          }
          onChange={handleVenueSelect}
          options={venueSelectOptions}
          error={errors?.venue?.message}
          removeSelection={removeSelection}
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
          handleUpdateLeg={handleLegUpdate}
          handleDelete={handleDeleteLegField}
          selectedLegs={selectedLegs}
          legIndexes={legIndexes}
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
