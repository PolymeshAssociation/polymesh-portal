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
import { IBasicFieldValues, BASIC_FORM_CONFIG } from '../config';
import { ISelectedAsset } from '~/components/AssetSelect/types';
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';
import { createBasicInstructionParams } from '../helpers';
import { useWindowWidth } from '~/hooks/utility';

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
  } = useForm<IBasicFieldValues>(BASIC_FORM_CONFIG);
  const { handleStatusChange } = useTransactionStatus();
  const [venues, setVenues] = useState<IVenueWithDetails[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<ISelectedAsset[]>([]);
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

  const handleAssetSelect = (item: ISelectedAsset) => {
    setSelectedAssets([item]);
  };

  const onSubmit = async (formData: IBasicFieldValues) => {
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
      <InputWrapper marginBotom={24}>
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
      {!!combinedPortfolios && (
        <AssetSelect
          portfolio={combinedPortfolios}
          index={0}
          handleAdd={handleAssetSelect}
          selectedAssets={selectedAssets}
        />
      )}
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
