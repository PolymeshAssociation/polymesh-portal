/* eslint-disable react/jsx-props-no-spreading */
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  UnsubCallback,
  Venue,
  VenueDetails,
} from '@polymeshassociation/polymesh-sdk/types';
import { AssetSelect } from '~/components';
import { Button, DropdownSelect } from '~/components/UiKit';
import { InstructionsContext } from '~/context/InstructionsContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { AccountContext } from '~/context/AccountContext';
import {
  StyledButtonsWrapper,
  StyledInput,
  StyledLabel,
} from '../../../styles';
import { InputWrapper, StyledErrorMessage } from '../../styles';
import { IFieldValues, FORM_CONFIG } from '../config';
import { ISelectedAsset } from '~/components/AssetSelect/types';
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';
import { createBasicInstructionParams, updateAssetsOnSelect } from '../helpers';

interface IBasicFormProps {
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}

interface IVenueWithDetails {
  venue: Venue;
  details: VenueDetails;
}

export const BasicForm: React.FC<IBasicFormProps> = ({ toggleModal }) => {
  const { createdVenues, instructionsLoading, refreshInstructions } =
    useContext(InstructionsContext);
  const { combinedPortfolios } = useContext(PortfolioContext);
  const { identity } = useContext(AccountContext);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<IFieldValues>(FORM_CONFIG);
  const { handleStatusChange } = useTransactionStatus();
  const [venues, setVenues] = useState<IVenueWithDetails[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [assetIndexes, setAssetIndexes] = useState<number[]>([0]);
  const [selectedAssets, setSelectedAssets] = useState<ISelectedAsset[]>([]);

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

  const handleAssetSelect = (item: ISelectedAsset) => {
    if (
      !selectedAssets.some(({ index }) => index === item.index) &&
      !selectedAssets.some(({ asset }) => asset === item.asset)
    ) {
      setSelectedAssets((prev) => [...prev, item]);
    } else {
      const updatedAssets = updateAssetsOnSelect(item, selectedAssets);

      setSelectedAssets(updatedAssets);
    }
  };
  const handleDeleteAssetField = (index: number) => {
    setAssetIndexes((prev) => prev.filter((prevIndex) => prevIndex !== index));

    const updatedAssets = selectedAssets.filter(
      (selectedAsset) => selectedAsset.index !== index,
    );
    setSelectedAssets(updatedAssets);
  };

  const onSubmit = async (formData: IFieldValues) => {
    if (!selectedVenue || !identity) return;

    let unsubCb: UnsubCallback | undefined;

    reset();
    toggleModal();
    try {
      const tx = await selectedVenue.addInstruction(
        createBasicInstructionParams({ selectedAssets, identity, formData }),
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
    !!selectedAssets.length &&
    selectedAssets.every(({ amount }) => amount > 0);

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
      <InputWrapper marginBotom={24}>
        <StyledLabel htmlFor="recipient">Recipient</StyledLabel>
        <StyledInput
          id="recipient"
          placeholder="Enter recipient address"
          {...register('recipient')}
        />
        {!!errors?.recipient?.message && (
          <StyledErrorMessage>
            {errors?.recipient?.message as string}
          </StyledErrorMessage>
        )}
      </InputWrapper>
      {!!combinedPortfolios &&
        assetIndexes.map((index) => (
          <AssetSelect
            key={index}
            portfolio={combinedPortfolios}
            index={index}
            handleAdd={handleAssetSelect}
            handleDelete={handleDeleteAssetField}
            selectedAssets={selectedAssets}
          />
        ))}
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
