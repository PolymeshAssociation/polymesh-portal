/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { VenueDetails } from '@polymeshassociation/polymesh-sdk/types';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { CopyToClipboard, Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { InstructionsContext } from '~/context/InstructionsContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { formatDid } from '~/helpers/formatters';
import { notifyError } from '~/helpers/notifications';
import {
  DescriptionText,
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldWrapper,
  StyledErrorMessage,
  StyledLink,
} from '../../../CreateAssetWizard/styles';
import {
  FieldValue,
  ModalActions,
  ModalContainer,
  ModalContent,
  VenueDetailsContainer,
} from '../../styles';

interface IAddVenueFormData {
  selectedVenue: string;
  manualVenueId: string;
}

interface IAddVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAllowedVenues: string[];
  onAddVenues: (params: {
    enabled: boolean;
    allowedVenues: BigNumber[];
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

export const AddVenueModal: React.FC<IAddVenueModalProps> = ({
  isOpen,
  onClose,
  currentAllowedVenues,
  onAddVenues,
  transactionInProcess,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { createdVenues } = useContext(InstructionsContext);
  const [selectedVenueDetails, setSelectedVenueDetails] =
    useState<VenueDetails | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchedVenueId, setFetchedVenueId] = useState<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const venueDetailsCache = useRef<Map<string, VenueDetails>>(new Map());
  const venueErrorCache = useRef<Map<string, string>>(new Map());

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        selectedVenue: yup.string(),
        manualVenueId: yup
          .string()
          .test(
            'not-already-added',
            'Venue already in allowed list',
            function checkDuplicate(value) {
              if (!value) return true;
              return !currentAllowedVenues.includes(value);
            },
          ),
      }),
    [currentAllowedVenues],
  );

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IAddVenueFormData>({
    mode: 'onBlur',
    defaultValues: {
      selectedVenue: '',
      manualVenueId: '',
    },
    resolver: yupResolver(validationSchema),
  });

  const selectedVenue = watch('selectedVenue');
  const manualVenueId = watch('manualVenueId');

  // Fetch venue details when venue ID changes (with debouncing for manual input)
  useEffect(() => {
    let isMounted = true;

    // Clear any pending timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    const currentVenueId = selectedVenue || manualVenueId;

    if (!currentVenueId) {
      setSelectedVenueDetails(null);
      setIsFetchingDetails(false);
      setFetchError(null);
      setFetchedVenueId(null);
      // Still need to return cleanup function
    } else {
      // Check cache first
      const cachedDetails = venueDetailsCache.current.get(currentVenueId);
      const cachedError = venueErrorCache.current.get(currentVenueId);

      if (cachedDetails) {
        // Use cached details immediately
        setSelectedVenueDetails(cachedDetails);
        setFetchedVenueId(currentVenueId);
        setFetchError(null);
        setIsFetchingDetails(false);
        return () => {
          isMounted = false;
        };
      }

      if (cachedError) {
        // Use cached error immediately
        setFetchError(cachedError);
        setSelectedVenueDetails(null);
        setFetchedVenueId(null);
        setIsFetchingDetails(false);
        return () => {
          isMounted = false;
        };
      }

      const fetchDetails = async () => {
        if (!sdk) return;

        setFetchError(null);

        try {
          const venue = await sdk.settlements.getVenue({
            id: new BigNumber(currentVenueId),
          });
          const details = await venue.details();

          // Always update cache, even if unmounted
          venueDetailsCache.current.set(currentVenueId, details);
          venueErrorCache.current.delete(currentVenueId);

          // Only update state if component is still mounted
          if (isMounted) {
            setSelectedVenueDetails(details);
            setFetchedVenueId(currentVenueId);
            setFetchError(null);
          }
        } catch (error) {
          // Always update cache, even if unmounted
          const errorMessage =
            (error as Error).message || 'Venue does not exist';
          venueErrorCache.current.set(currentVenueId, errorMessage);
          venueDetailsCache.current.delete(currentVenueId);

          // Only update state if component is still mounted
          if (isMounted) {
            setFetchError(errorMessage);
            setSelectedVenueDetails(null);
          }
        } finally {
          if (isMounted) {
            setIsFetchingDetails(false);
          }
        }
      };

      setIsFetchingDetails(true);
      // If it's from manual input, debounce the fetch
      if (manualVenueId) {
        fetchTimeoutRef.current = setTimeout(() => {
          fetchDetails();
        }, 400);
      } else {
        // If from dropdown, fetch immediately
        fetchDetails();
      }
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, [selectedVenue, manualVenueId, sdk]);

  // Handle owned venue selection
  const handleOwnedVenueChange = (venueId: string) => {
    setValue('selectedVenue', venueId);
    setValue('manualVenueId', ''); // Clear manual input
  };

  // Handle manual venue ID input
  const handleManualVenueChange = (venueId: string) => {
    const numericValue = venueId.replace(/[^0-9]/g, '');
    setValue('manualVenueId', numericValue, { shouldValidate: true });
    setValue('selectedVenue', ''); // Clear dropdown selection
  };

  const onSubmit = async (data: IAddVenueFormData) => {
    try {
      const venueIdToAdd = data.selectedVenue || data.manualVenueId;

      if (!venueIdToAdd) {
        notifyError('Please select or enter a venue ID');
        return;
      }

      await onAddVenues({
        enabled: true,
        allowedVenues: [new BigNumber(venueIdToAdd)],
        onTransactionRunning: onClose,
      });
    } catch (error) {
      notifyError(
        `Error adding venue: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // Cancel any pending operations
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }

      // Reset form and state
      reset({ selectedVenue: '', manualVenueId: '' });
      setSelectedVenueDetails(null);
      setIsFetchingDetails(false);
      setFetchError(null);
      setFetchedVenueId(null);
    }
  }, [isOpen, reset]);

  const availableCreatedVenues = useMemo(
    () =>
      createdVenues.filter((venue) => {
        const venueId = venue.id.toString();
        return !currentAllowedVenues.includes(venueId);
      }),
    [createdVenues, currentAllowedVenues],
  );

  const currentVenueId = selectedVenue || manualVenueId;

  // Check if the venue ID in the form matches the venue ID we have details for
  const detailsMatchCurrentVenue =
    selectedVenueDetails && currentVenueId && fetchedVenueId === currentVenueId;

  const isFormValid = !!(
    currentVenueId &&
    detailsMatchCurrentVenue &&
    !fetchError &&
    !isFetchingDetails
  );

  if (!isOpen) return null;

  return (
    <Modal handleClose={onClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Add Allowed Venue
          </Heading>
          <DescriptionText>
            Venue filtering ensures that only predefined parties can create
            settlement instructions involving this asset. Add venues that are
            allowed to settle this asset. For more information, visit the{' '}
            <StyledLink
              href="https://developers.polymesh.network/settlement/venues/#venue-filtering"
              target="_blank"
              rel="noopener noreferrer"
            >
              Venues Documentation
            </StyledLink>
            .
          </DescriptionText>
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Select Owned Venue</FieldLabel>
              <FieldSelect
                value={selectedVenue}
                onChange={(e) => handleOwnedVenueChange(e.target.value)}
                disabled={transactionInProcess}
              >
                <option value="">Select owned venue</option>
                {availableCreatedVenues.map((venue) => (
                  <option key={venue.id.toString()} value={venue.id.toString()}>
                    Venue ID {venue.id.toString()}
                  </option>
                ))}
              </FieldSelect>
            </FieldRow>
          </FieldWrapper>
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Or Enter Venue ID</FieldLabel>
              <FieldInput
                type="text"
                placeholder="Enter venue ID"
                value={manualVenueId}
                $hasError={!!errors?.manualVenueId}
                disabled={transactionInProcess}
                onChange={(e) => handleManualVenueChange(e.target.value)}
              />
            </FieldRow>
            {errors?.manualVenueId && (
              <StyledErrorMessage>
                {errors.manualVenueId.message}
              </StyledErrorMessage>
            )}
            {fetchError && !isFetchingDetails && (
              <StyledErrorMessage>{fetchError}</StyledErrorMessage>
            )}
          </FieldWrapper>
          <VenueDetailsContainer>
            <FieldRow>
              <FieldLabel>Venue ID</FieldLabel>
              <FieldValue>{currentVenueId || null}</FieldValue>
            </FieldRow>
            <FieldRow>
              <FieldLabel>Venue Owner</FieldLabel>
              <FieldValue>
                {isFetchingDetails && 'Loading...'}
                {!isFetchingDetails && selectedVenueDetails && (
                  <>
                    {formatDid(selectedVenueDetails.owner.did)}
                    <CopyToClipboard value={selectedVenueDetails.owner.did} />
                  </>
                )}
              </FieldValue>
            </FieldRow>
            <FieldRow>
              <FieldLabel>Venue Type</FieldLabel>
              <FieldValue>
                {isFetchingDetails
                  ? 'Loading...'
                  : selectedVenueDetails?.type || null}
              </FieldValue>
            </FieldRow>
            <FieldRow>
              <FieldLabel>Description</FieldLabel>
              <FieldValue>
                {isFetchingDetails
                  ? 'Loading...'
                  : selectedVenueDetails?.description || null}
              </FieldValue>
            </FieldRow>
          </VenueDetailsContainer>
          <ModalActions>
            <Button
              variant="modalSecondary"
              onClick={onClose}
              disabled={transactionInProcess}
            >
              Cancel
            </Button>
            <Button
              variant="modalPrimary"
              onClick={handleSubmit(onSubmit)}
              disabled={!isFormValid || transactionInProcess}
            >
              Add Venue
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
