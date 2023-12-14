/* eslint-disable react/jsx-props-no-spreading */
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  UnsubCallback,
  Venue,
  VenueDetails,
} from '@polymeshassociation/polymesh-sdk/types';
// import { AssetForm } from '~/components';
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
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';
import { createBasicInstructionParams } from '../helpers';
import { useWindowWidth } from '~/hooks/utility';

import AssetForm from '~/components/AssetForm';
import { useAssetForm } from '~/components/AssetForm/hooks';
import { MAX_NFTS_PER_LEG } from '~/components/AssetForm/constants';
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
  const { isMobile } = useWindowWidth();

  const {
    assets,
    collections,
    selectedAssets,
    getAssetBalance,
    getNftsPerCollection,
    handleDeleteAsset,
    handleSelectAsset,
  } = useAssetForm(combinedPortfolios);

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

  const onSubmit = async (formData: IBasicFieldValues) => {
    if (!selectedVenue || !identity) return;

    let unsubCb: UnsubCallback | undefined;

    reset();
    toggleModal();
    try {
      const tx = await selectedVenue.addInstruction(
        createBasicInstructionParams({
          selectedAssets: Object.values(selectedAssets),
          identity,
          formData,
        }),
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
    !!Object.keys(selectedAssets).length &&
    !Object.values(selectedAssets).some((asset) => {
      if ('amount' in asset) {
        return asset.amount.toNumber() <= 0;
      }
      return !asset.nfts?.length;
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
      <InputWrapper $marginBottom={24}>
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
      <InputWrapper $marginBottom={24}>
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

      {Object.keys(selectedAssets).map((asset) => (
        <AssetForm
          key={asset}
          index={asset}
          assets={assets}
          collections={collections}
          getNftsPerCollection={getNftsPerCollection}
          handleDeleteAsset={handleDeleteAsset}
          handleSelectAsset={handleSelectAsset}
          assetBalance={getAssetBalance(selectedAssets[asset].asset)}
          maxNfts={MAX_NFTS_PER_LEG}
        />
      ))}

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
