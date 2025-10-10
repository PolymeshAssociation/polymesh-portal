/* eslint-disable react/jsx-props-no-spreading */
import { Venue, VenueDetails } from '@polymeshassociation/polymesh-sdk/types';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import AssetForm from '~/components/AssetForm';
import { MAX_NFTS_PER_LEG } from '~/components/AssetForm/constants';
import { useAssetForm } from '~/components/AssetForm/hooks';
import { Button, DropdownSelect } from '~/components/UiKit';
import { InstructionsContext } from '~/context/InstructionsContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { useWindowWidth } from '~/hooks/utility';
import {
  StyledButtonsWrapper,
  StyledInput,
  StyledLabel,
} from '../../../styles';
import { InputWrapper, StyledErrorMessage } from '../../styles';
import { BASIC_FORM_CONFIG, IBasicFieldValues } from '../config';
import { createBasicInstructionParams } from '../helpers';

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
  const { allPortfolios } = useContext(PortfolioContext);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const [removeSelection, setRemoveSelection] = useState<boolean>(false);
  const [venues, setVenues] = useState<IVenueWithDetails[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] =
    useState<IPortfolioData | null>(allPortfolios[0]);

  const { isMobile } = useWindowWidth();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<IBasicFieldValues>(BASIC_FORM_CONFIG);
  const { executeTransaction, isTransactionInProgress } =
    useTransactionStatusContext();
  const {
    assets,
    collections,
    selectedAssets,
    getAssetBalance,
    nfts,
    getNftsPerCollection,
    handleDeleteAsset,
    handleSelectAsset,
  } = useAssetForm(selectedPortfolio);

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

  const handleSenderSelect = useCallback(
    (combinedId: string | null) => {
      if (!combinedId) {
        setSelectedPortfolio(null);
        setValue('senderPortfolio', '', { shouldValidate: true });
        return;
      }
      const id = combinedId.split('/')[0].trim();
      const selectedSendingPortfolio = allPortfolios.find((item) =>
        Number.isNaN(Number(id)) ? item.id === 'default' : item.id === id,
      );
      if (selectedSendingPortfolio) {
        setSelectedPortfolio(selectedSendingPortfolio);
        setValue('senderPortfolio', selectedSendingPortfolio.id, {
          shouldValidate: true,
        });
      } else {
        setSelectedPortfolio(null);
        setValue('senderPortfolio', '', { shouldValidate: true });
      }
    },
    [allPortfolios, setValue],
  );

  const onSubmit = async (formData: IBasicFieldValues) => {
    if (!selectedPortfolio || !sdk) return;

    try {
      const transactionPromise = sdk.settlements.addInstruction(
        createBasicInstructionParams({
          selectedAssets: Object.values(selectedAssets),
          selectedPortfolio,
          formData,
        }),
      );

      await executeTransaction(transactionPromise, {
        onTransactionRunning: () => {
          reset();
          toggleModal();
        },
        onSuccess: async () => {
          refreshInstructions();
        },
      });
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const isDataValid = useMemo(() => {
    return (
      isValid &&
      !!selectedPortfolio &&
      !!Object.keys(selectedAssets).length &&
      !Object.values(selectedAssets).some((asset) => {
        if ('amount' in asset) {
          return asset.amount.toNumber() <= 0;
        }
        return !asset.nfts?.length;
      })
    );
  }, [isValid, selectedPortfolio, selectedAssets]);

  return (
    <>
      <InputWrapper $marginBottom={24}>
        {venueSelectOptions.length > 0 && (
          <DropdownSelect
            label="Venue (Optional)"
            placeholder="Select venue"
            onChange={handleVenueSelect}
            options={venueSelectOptions}
            error={errors?.venue?.message}
            removeSelection={removeSelection}
          />
        )}
      </InputWrapper>
      {allPortfolios.length > 1 && (
        <InputWrapper $marginBottom={24}>
          <DropdownSelect
            selected={allPortfolios[0].name}
            label="Sending Portfolio"
            placeholder="Select portfolio"
            onChange={handleSenderSelect}
            options={allPortfolios.map(({ id, name }) =>
              id === 'default' ? name : `${id} / ${name}`,
            )}
            error={undefined}
            enableSearch
          />
          {!!errors?.senderPortfolio?.message && (
            <StyledErrorMessage>
              {errors?.senderPortfolio?.message as string}
            </StyledErrorMessage>
          )}
        </InputWrapper>
      )}
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
          portfolioName={selectedPortfolio?.name || ''}
          nfts={nfts}
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
          disabled={!isDataValid || isTransactionInProgress}
          onClick={handleSubmit(onSubmit)}
        >
          Send
        </Button>
      </StyledButtonsWrapper>
    </>
  );
};
