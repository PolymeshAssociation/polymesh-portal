/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { VenueDetails } from '@polymeshassociation/polymesh-sdk/types';
import {
  FormContainer,
  DescriptionText,
  NavigationWrapper,
  FieldLabel,
  FieldInput,
  Button,
  StyledErrorMessage,
  FieldRow,
  FieldWrapper,
  IconWrapper,
  HeaderRow,
  StyledForm,
  StyledFormSection,
  FieldSelect,
  SectionTitle,
  SubSectionTitle,
  VenueSelectRow,
  ChipContainer,
  FieldInputWithButton,
  StyledLink,
} from '../styles';
import { WizardStepProps } from '../types';
import StepNavigation from '../components/StepNavigation';
import { PolymeshContext } from '~/context/PolymeshContext';
import { InstructionsContext } from '~/context/InstructionsContext';
import { Icon } from '~/components';
import Toggler from '../components/Toggler';
import Chip from '../components/Chip';
import { notifyError } from '~/helpers/notifications';

interface SettlementRestrictionsFormData {
  requiredMediators: { mediator: string }[];
  allowedVenues: { allowed: string }[];
  enabled: boolean;
}

const SettlementRestrictionsStep: React.FC<WizardStepProps> = ({
  onBack,
  onComplete,
  defaultValues,
  isFinalStep,
  isLoading,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { createdVenues } = useContext(InstructionsContext);
  const [venueDetails, setVenueDetails] = useState<
    Record<string, VenueDetails>
  >({});
  const [manualVenueInput, setManualVenueInput] = useState<string>('');
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
    const fetchAllVenueDetails = async () => {
      const venueIds = new Set([
        ...createdVenues.map((venue) => venue.id.toString()),
        ...(defaultValues.venueRestrictions?.allowedVenues?.map((v) =>
          v.toString(),
        ) || []),
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

    fetchAllVenueDetails();
  }, [createdVenues, fetchVenueDetails, defaultValues.venueRestrictions]);

  const validationSchema = yup.object().shape({
    requiredMediators: yup.array().of(
      yup.object().shape({
        mediator: yup
          .string()
          .required('Mediator DID is required')
          .matches(/^0x[0-9a-fA-F]{64}$/, 'Mediator DID must be valid')
          .test(
            'is-valid-identity',
            'Mediator DID does not exist',
            async function validateDid(value) {
              if (!value || !value.match(/^0x[0-9a-fA-F]{64}$/)) return true;
              if (!sdk) return false;
              try {
                const isValid = await sdk.identities.isIdentityValid({
                  identity: value,
                });
                return isValid;
              } catch (error) {
                return false;
              }
            },
          ),
      }),
    ),
    venueRestrictions: yup.object().shape({
      allowedVenues: yup.array().of(
        yup.object().shape({
          allowed: yup.string().required('Allowed venue is required'),
        }),
      ),
      enabled: yup.boolean(),
    }),
  });

  const formDataDefaultValues = useMemo(() => {
    const { requiredMediators, venueRestrictions } = defaultValues;
    return {
      requiredMediators:
        requiredMediators?.map((mediator) => ({ mediator })) || [],
      allowedVenues:
        venueRestrictions?.allowedVenues?.map((allowedVenue) => ({
          allowed: allowedVenue.toString(),
        })) || [],
      enabled: venueRestrictions?.enabled || false,
    };
  }, [defaultValues]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<SettlementRestrictionsFormData>({
    defaultValues: formDataDefaultValues,
    resolver: yupResolver(validationSchema),
  });

  const {
    fields: mediatorFields,
    append: appendMediator,
    remove: removeMediator,
  } = useFieldArray({
    control,
    name: 'requiredMediators',
  });

  const {
    fields: allowedVenueFields,
    append: appendAllowedVenue,
    remove: removeAllowedVenue,
  } = useFieldArray({
    control,
    name: 'allowedVenues',
  });

  const watchedMediators = watch('requiredMediators');

  const handleVenueRestrictionsToggle = (enabled: boolean) => {
    if (!enabled) {
      setValue('allowedVenues', []);
    }
    setValue('enabled', enabled);
  };

  const onSubmit = (data: SettlementRestrictionsFormData) => {
    const { requiredMediators, allowedVenues, enabled } = data;
    const submittedFormData = {
      ...defaultValues,
      requiredMediators: requiredMediators.map((value) => value.mediator),
      venueRestrictions: {
        allowedVenues: allowedVenues.map(
          (value) => new BigNumber(value.allowed),
        ),
        enabled,
      },
    };
    onComplete(submittedFormData);
  };

  const venueRestrictionsEnabled = watch('enabled');

  const handleAddVenue = async (venueId: string) => {
    if (!venueId) return;

    // Check if venue is already in allowed list only
    const isInAllowed = allowedVenueFields.some(
      (field) => field.allowed === venueId,
    );

    if (isInAllowed) {
      notifyError(`Venue ${venueId} already added`);
      return;
    }

    try {
      await fetchVenueDetails(venueId);
      setVenueDetails({ ...venueDetailsCache.current });
      appendAllowedVenue({ allowed: venueId });
      setManualVenueInput('');
    } catch (error) {
      notifyError((error as Error).message);
    }
  };

  const handleManualVenueAdd = (value: string) => {
    if (value) {
      handleAddVenue(value);
    }
  };

  const handleManualVenueInput = (
    value: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setInput(numericValue);
  };

  return (
    <FormContainer>
      <h2>Settlement Restrictions</h2>

      <DescriptionText>
        Configure settlement restrictions for your asset. Mediators are parties
        that must approve a settlement instruction (e.g. a transfer agent)
        before an instruction can execute on chain. Venue restrictions ensure
        only predefined parties can create settlement instructions involving
        your asset. Learn more about{' '}
        <StyledLink
          href="https://developers.polymesh.network/settlement/mediators/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mediators
        </StyledLink>{' '}
        and{' '}
        <StyledLink
          href="https://developers.polymesh.network/settlement/venues/#venue-filtering"
          target="_blank"
          rel="noopener noreferrer"
        >
          Venue Filtering
        </StyledLink>
        .
      </DescriptionText>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <StyledFormSection>
          <HeaderRow>
            <SectionTitle>Required Mediators</SectionTitle>
          </HeaderRow>
          {mediatorFields.map((field, index) => (
            <FieldWrapper key={field.id}>
              <FieldRow>
                <FieldLabel>Mediator DID #{index + 1}</FieldLabel>
                <FieldInputWithButton>
                  <FieldInput
                    placeholder="Enter mediator DID"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    {...register(
                      `requiredMediators.${index}.mediator` as const,
                    )}
                    value={watchedMediators?.[index]?.mediator || ''}
                    $hasError={!!errors.requiredMediators?.[index]?.mediator}
                  />
                  <IconWrapper onClick={() => removeMediator(index)}>
                    <Icon name="Delete" size="20px" />
                  </IconWrapper>
                </FieldInputWithButton>
              </FieldRow>
              {errors?.requiredMediators?.[index]?.mediator && (
                <StyledErrorMessage>
                  {errors.requiredMediators[index]?.mediator?.message}
                </StyledErrorMessage>
              )}
            </FieldWrapper>
          ))}
          <Button
            type="button"
            onClick={() => appendMediator({ mediator: '' })}
          >
            Add Required Mediator
          </Button>
        </StyledFormSection>

        <StyledFormSection>
          <HeaderRow>
            <SectionTitle>Enable Venue Restrictions</SectionTitle>
            <Controller
              name="enabled"
              control={control}
              render={({ field }) => (
                <Toggler
                  id="enable-venue-restrictions"
                  isEnabled={field.value || false}
                  handleChange={handleVenueRestrictionsToggle}
                />
              )}
            />
          </HeaderRow>

          {venueRestrictionsEnabled && (
            <FieldWrapper>
              <HeaderRow>
                <SubSectionTitle>Allowed Venues</SubSectionTitle>
              </HeaderRow>
              <FieldRow>
                <Controller
                  name="allowedVenues"
                  control={control}
                  render={() => (
                    <VenueSelectRow>
                      <FieldSelect
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddVenue(e.target.value);
                          }
                        }}
                      >
                        <option value="">Select owned venue</option>
                        {createdVenues
                          .filter((venue) => {
                            const venueId = venue.id.toString();
                            const isInAllowed = allowedVenueFields.some(
                              (field) => field.allowed === venueId,
                            );
                            return !isInAllowed;
                          })
                          .map((venue) => (
                            <option
                              key={venue.id.toString()}
                              value={venue.id.toString()}
                            >
                              {`${venue.id.toString()} - ${venueDetails[venue.id.toString()]?.description}`}
                            </option>
                          ))}
                      </FieldSelect>
                      <FieldInput
                        type="text"
                        placeholder="Or enter venue ID"
                        value={manualVenueInput}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleManualVenueAdd(manualVenueInput);
                          }
                        }}
                        onChange={(e) =>
                          handleManualVenueInput(
                            e.target.value,
                            setManualVenueInput,
                          )
                        }
                      />
                      <Button
                        type="button"
                        onClick={() => handleManualVenueAdd(manualVenueInput)}
                      >
                        Add
                      </Button>
                    </VenueSelectRow>
                  )}
                />
              </FieldRow>
              <ChipContainer>
                {allowedVenueFields.map((field, index) => (
                  <Chip
                    key={field.id}
                    label={`${field.allowed} - ${venueDetails[field.allowed]?.description || ''}`}
                    onDelete={() => removeAllowedVenue(index)}
                  />
                ))}
              </ChipContainer>
            </FieldWrapper>
          )}
        </StyledFormSection>
      </StyledForm>
      <NavigationWrapper>
        <StepNavigation
          onBack={onBack}
          onNext={handleSubmit(onSubmit)}
          isFinalStep={isFinalStep}
          disabled={Object.keys(errors).length > 0}
          isLoading={isLoading}
        />
      </NavigationWrapper>
    </FormContainer>
  );
};

export default SettlementRestrictionsStep;
