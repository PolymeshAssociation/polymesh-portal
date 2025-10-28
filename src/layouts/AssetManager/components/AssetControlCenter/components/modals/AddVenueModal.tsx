/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { VenueDetails } from '@polymeshassociation/polymesh-sdk/types';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { InstructionsContext } from '~/context/InstructionsContext';
import { notifyError } from '~/helpers/notifications';
import {
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldWrapper,
  StyledErrorMessage,
  StyledLink,
  FieldSelect,
  VenueSelectRow,
  ChipContainer,
  Button as WizardButton,
} from '../../../CreateAssetWizard/styles';
import Chip from '../../../CreateAssetWizard/components/Chip';
import { useAssetActionsContext } from '../../context';
import { ModalActions, ModalContainer, ModalContent } from '../../styles';

interface IAddVenueFormData {
  venueId: string;
}

interface IAddVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAllowedVenues: string[];
}

export const AddVenueModal: React.FC<IAddVenueModalProps> = ({
  isOpen,
  onClose,
  currentAllowedVenues,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { createdVenues } = useContext(InstructionsContext);
  const { setVenueFiltering, transactionInProcess } = useAssetActionsContext();
  const [venueDetails, setVenueDetails] = useState<
    Record<string, VenueDetails>
  >({});
  const [manualVenueInput, setManualVenueInput] = useState<string>('');
  const [venuesToAdd, setVenuesToAdd] = useState<string[]>([]);
  const venueDetailsCache = useRef<Record<string, VenueDetails>>({});

  const fetchVenueDetails = useCallback(
    async (venueId: string) => {
      if (!sdk) throw new Error('SDK not available');

      if (venueDetailsCache.current[venueId]) {
        return venueDetailsCache.current[venueId];
      }

      try {
        const venue = await sdk.settlements.getVenue({
          id: new BigNumber(venueId),
        });
        const details = await venue.details();

        venueDetailsCache.current[venueId] = details;
        return details;
      } catch (error) {
        throw new Error(`Venue ${venueId} does not exist`);
      }
    },
    [sdk],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchAllVenueDetails = async () => {
      const venueIds = new Set([
        ...createdVenues.map((venue) => venue.id.toString()),
        ...currentAllowedVenues,
        ...venuesToAdd,
      ]);

      const detailsResults = await Promise.all(
        Array.from(venueIds).map(async (venueId) => {
          try {
            await fetchVenueDetails(venueId);
            return { id: venueId, details: venueDetailsCache.current[venueId] };
          } catch (error) {
            return null;
          }
        }),
      );

      if (!isMounted) return;

      const newDetails: Record<string, VenueDetails> = {};
      detailsResults.forEach((result) => {
        if (result) {
          newDetails[result.id] = result.details;
        }
      });

      venueDetailsCache.current = {
        ...venueDetailsCache.current,
        ...newDetails,
      };
      setVenueDetails({ ...venueDetailsCache.current });
    };

    if (isOpen) {
      fetchAllVenueDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [
    createdVenues,
    fetchVenueDetails,
    currentAllowedVenues,
    venuesToAdd,
    isOpen,
  ]);

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        venueId: yup
          .string()
          .test(
            'not-already-added',
            'Venue already added',
            function checkDuplicate(value) {
              if (!value) return true;
              return (
                !currentAllowedVenues.includes(value) &&
                !venuesToAdd.includes(value)
              );
            },
          ),
      }),
    [currentAllowedVenues, venuesToAdd],
  );

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<IAddVenueFormData>({
    mode: 'onChange',
    defaultValues: {
      venueId: '',
    },
    resolver: yupResolver(validationSchema),
  });

  const handleAddVenue = async (venueId: string) => {
    if (!venueId) return;

    if (
      currentAllowedVenues.includes(venueId) ||
      venuesToAdd.includes(venueId)
    ) {
      notifyError(`Venue ${venueId} already added`);
      return;
    }

    try {
      await fetchVenueDetails(venueId);
      setVenueDetails({ ...venueDetailsCache.current });
      setVenuesToAdd((prev) => [...prev, venueId]);
      setManualVenueInput('');
      setValue('venueId', '');
    } catch (error) {
      notifyError((error as Error).message);
    }
  };

  const handleRemoveVenue = (venueId: string) => {
    setVenuesToAdd((prev) => prev.filter((id) => id !== venueId));
  };

  const onSubmit = async () => {
    try {
      if (venuesToAdd.length === 0) {
        notifyError('Please add at least one venue');
        return;
      }

      await setVenueFiltering({
        enabled: true,
        allowedVenues: venuesToAdd.map((id) => new BigNumber(id)),
      });

      reset({ venueId: '' });
      setManualVenueInput('');
      setVenuesToAdd([]);
      onClose();
    } catch (error) {
      notifyError(
        `Error adding venues: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  const resetForm = useCallback(() => {
    reset({ venueId: '' });
    setManualVenueInput('');
    setVenuesToAdd([]);
  }, [reset]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleManualVenueInput = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setManualVenueInput(numericValue);
    setValue('venueId', numericValue, { shouldValidate: true });
  };

  const handleManualVenueAdd = () => {
    if (manualVenueInput) {
      handleAddVenue(manualVenueInput);
    }
  };

  const handleSelectVenue = (value: string) => {
    if (value) {
      handleAddVenue(value);
    }
  };

  const availableCreatedVenues = useMemo(
    () =>
      createdVenues.filter((venue) => {
        const venueId = venue.id.toString();
        return (
          !currentAllowedVenues.includes(venueId) &&
          !venuesToAdd.includes(venueId)
        );
      }),
    [createdVenues, currentAllowedVenues, venuesToAdd],
  );

  if (!isOpen) return null;

  return (
    <Modal handleClose={onClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Add Venue Restriction
          </Heading>
          <Text>
            Venue filtering ensures that only predefined parties can create
            settlement instructions involving this asset. Add venues that are
            allowed to settle this asset.{' '}
            <StyledLink
              href="https://developers.polymesh.network/settlement/venues/#venue-filtering"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about venue filtering
            </StyledLink>{' '}
            in the Polymesh documentation.
          </Text>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Select Owned Venue</FieldLabel>
              <FieldSelect
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleSelectVenue(e.target.value);
                  }
                }}
                disabled={transactionInProcess}
              >
                <option value="">Select owned venue</option>
                {availableCreatedVenues.map((venue) => (
                  <option key={venue.id.toString()} value={venue.id.toString()}>
                    {`${venue.id.toString()} - ${
                      venueDetails[venue.id.toString()]?.description || ''
                    }`}
                  </option>
                ))}
              </FieldSelect>
            </FieldRow>

            <FieldRow style={{ marginTop: '16px' }}>
              <FieldLabel>Or Enter Venue ID Manually</FieldLabel>
              <Controller
                name="venueId"
                control={control}
                render={() => (
                  <VenueSelectRow>
                    <FieldInput
                      type="text"
                      placeholder="Enter venue ID"
                      value={manualVenueInput}
                      $hasError={!!errors?.venueId}
                      disabled={transactionInProcess}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleManualVenueAdd();
                        }
                      }}
                      onChange={(e) => handleManualVenueInput(e.target.value)}
                    />
                    <WizardButton
                      type="button"
                      onClick={handleManualVenueAdd}
                      disabled={transactionInProcess}
                    >
                      Add
                    </WizardButton>
                  </VenueSelectRow>
                )}
              />
            </FieldRow>

            {errors?.venueId && (
              <StyledErrorMessage>{errors.venueId.message}</StyledErrorMessage>
            )}

            {venuesToAdd.length > 0 && (
              <ChipContainer>
                {venuesToAdd.map((venueId) => (
                  <Chip
                    key={venueId}
                    label={`${venueId} - ${venueDetails[venueId]?.description || ''}`}
                    onDelete={() => handleRemoveVenue(venueId)}
                  />
                ))}
              </ChipContainer>
            )}
          </FieldWrapper>

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
              disabled={venuesToAdd.length === 0 || transactionInProcess}
            >
              Add Venue{venuesToAdd.length > 1 ? 's' : ''}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
