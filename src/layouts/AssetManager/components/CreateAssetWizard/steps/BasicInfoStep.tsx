/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  KnownAssetType,
  KnownNftType,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  FormContainer,
  FieldLabel,
  FieldRow,
  FieldWrapper,
  StyledErrorMessage,
  NavigationWrapper,
  StyledFormSection,
  DescriptionText,
  StyledForm,
  FieldInput,
  FieldSelect,
} from '../styles';
import { WizardData, WizardStepProps } from '../types';
import StepNavigation from '../components/StepNavigation';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AssetContext } from '~/context/AssetContext';
import { splitCamelCase } from '~/helpers/formatters';

const createSchema = () =>
  yup.object().shape({
    fungibility: yup.string().required('Fungibility is required'),
    assetType: yup.string().required('Asset Type is required'),
    customAssetType: yup.string().when('assetType', {
      is: 'Custom',
      then: (schema) => schema.required('Custom asset type is required'),
    }),
    name: yup.string(),
    ticker: yup.string(),
    isDivisible: yup.boolean().required('Please select Divisibility'),
    fundingRound: yup.string(),
  });

const BasicInfoStep: React.FC<WizardStepProps> = ({
  onComplete,
  defaultValues,
  isFinalStep,
  setAssetData,
  isLoading,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { tickerReservations } = useContext(AssetContext);
  const validationTokenRef = useRef(0);
  const [tickerValidating, setTickerValidating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isValidating },
  } = useForm<WizardData>({
    mode: 'onSubmit',
    resolver: yupResolver(createSchema()),
    defaultValues,
  });

  const watchedTicker = watch('ticker');
  const watchedFungibility = watch('fungibility');
  const watchedAssetType = watch('assetType');

  const isTickerAvailable = useCallback(
    async (ticker: string): Promise<boolean> => {
      if (!sdk) {
        return false;
      }
      try {
        const isOwnedReservation = tickerReservations.some(
          (r: { ticker: string }) => r.ticker === ticker,
        );
        if (isOwnedReservation) {
          return true;
        }
        const tickerResult = await sdk.assets.isTickerAvailable({ ticker });
        return tickerResult;
      } catch (error) {
        return false;
      }
    },
    [sdk, tickerReservations],
  );

  useEffect(() => {
    const currentToken = validationTokenRef.current + 1;
    validationTokenRef.current = currentToken;

    setTickerValidating(true);

    const validateTicker = async () => {
      const ticker = watchedTicker?.trim().toUpperCase();

      if (!ticker || ticker === '') {
        if (currentToken === validationTokenRef.current) {
          clearErrors('ticker');
          setTickerValidating(false);
        }
        return;
      }

      if (ticker.length > 12) {
        if (currentToken === validationTokenRef.current) {
          setError('ticker', {
            message: 'Ticker must be less than 12 characters',
          });
          setTickerValidating(false);
        }
        return;
      }

      if (!/^[A-Z0-9_\-./]*$/.test(ticker)) {
        if (currentToken === validationTokenRef.current) {
          setError('ticker', {
            message:
              'Ticker can only contain alphanumeric values, "_", "-", ".", and "/"',
          });
          setTickerValidating(false);
        }
        return;
      }

      try {
        const isAvailable = await isTickerAvailable(ticker);
        if (currentToken === validationTokenRef.current) {
          if (!isAvailable) {
            setError('ticker', {
              message: 'Ticker is not available',
            });
          } else {
            clearErrors('ticker');
          }
          setTickerValidating(false);
        }
      } catch (error) {
        if (currentToken === validationTokenRef.current) {
          setError('ticker', {
            message: 'Error checking ticker availability',
          });
          setTickerValidating(false);
        }
      }
    };

    const debounceTimeout = setTimeout(() => {
      if (currentToken === validationTokenRef.current) {
        validateTicker();
      }
    }, 200);

    return () => clearTimeout(debounceTimeout);
  }, [watchedTicker, isTickerAvailable, setError, clearErrors]);

  const assetTypes = useMemo(
    () =>
      watchedFungibility === 'fungible'
        ? [...(Object.values(KnownAssetType) as KnownAssetType[]), 'Custom']
        : [...(Object.values(KnownNftType) as KnownNftType[]), 'Custom'],
    [watchedFungibility],
  );

  const handleFungibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setValue('fungibility', value, { shouldValidate: true });
    const newAssetTypes =
      value === 'fungible'
        ? Object.values(KnownAssetType)
        : Object.values(KnownNftType);
    setValue('assetType', newAssetTypes[0], { shouldValidate: true });
    setValue('customAssetType', '', { shouldValidate: true });
    // Immediately update the assetData in parent when fungibility changes
    if (setAssetData) {
      setAssetData((prev) => ({ ...prev, fungibility: value }));
    }
  };

  const handleAssetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setValue('assetType', value, { shouldValidate: true });
    if (value !== 'Custom') {
      setValue('customAssetType', '', { shouldValidate: true });
    }
  };

  const onSubmit = (data: WizardData) => {
    onComplete(data);
  };

  return (
    <FormContainer>
      <h2>Basic Information</h2>
      <DescriptionText>
        This Asset creation wizard allow you to define the fundamental
        characteristics of your Polymesh asset. Polymesh offers a wide range of
        features allowing you to customise your asset to your specific use case.
      </DescriptionText>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <StyledFormSection>
          <FieldWrapper>
            <FieldRow>
              <FieldLabel htmlFor="fungibility">Fungibility</FieldLabel>
              <FieldSelect
                id="fungibility"
                {...register('fungibility', {
                  onChange: handleFungibilityChange,
                })}
              >
                <option value="fungible">Fungible</option>
                <option value="nonFungible">Non-Fungible Collection</option>
              </FieldSelect>
            </FieldRow>
            {errors.fungibility && (
              <StyledErrorMessage>
                {errors.fungibility.message}
              </StyledErrorMessage>
            )}
          </FieldWrapper>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel htmlFor="assetType">Asset Type</FieldLabel>
              <FieldSelect
                id="assetType"
                value={watchedAssetType}
                {...register('assetType', {
                  onChange: handleAssetTypeChange,
                })}
              >
                {assetTypes.map((type) => (
                  <option key={type} value={type}>
                    {splitCamelCase(type)}
                  </option>
                ))}
              </FieldSelect>
            </FieldRow>
            {errors.assetType && (
              <StyledErrorMessage>
                {errors.assetType.message}
              </StyledErrorMessage>
            )}
          </FieldWrapper>

          {watchedAssetType === 'Custom' && (
            <FieldWrapper>
              <FieldRow>
                <FieldLabel htmlFor="customAssetType">Custom Type</FieldLabel>
                <FieldInput
                  id="customAssetType"
                  placeholder="Enter custom asset type"
                  {...register('customAssetType')}
                  $hasError={!!errors.customAssetType}
                />
              </FieldRow>
              {errors.customAssetType && (
                <StyledErrorMessage>
                  {errors.customAssetType.message}
                </StyledErrorMessage>
              )}
            </FieldWrapper>
          )}

          <FieldWrapper>
            <FieldRow>
              <FieldLabel htmlFor="name">Asset Name</FieldLabel>
              <FieldInput
                id="name"
                placeholder="Enter name (optional)"
                {...register('name')}
                $hasError={!!errors.name}
              />
            </FieldRow>
            {errors.name && (
              <StyledErrorMessage>{errors.name.message}</StyledErrorMessage>
            )}
          </FieldWrapper>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel htmlFor="ticker">Ticker</FieldLabel>
              <FieldInput
                id="ticker"
                placeholder="Enter ticker (optional)"
                value={watchedTicker?.toUpperCase().trim()}
                {...register('ticker')}
                $hasError={!!errors.ticker}
              />
            </FieldRow>
            {errors.ticker && (
              <StyledErrorMessage>{errors.ticker.message}</StyledErrorMessage>
            )}
          </FieldWrapper>

          {watchedFungibility === 'fungible' && (
            <FieldWrapper>
              <FieldRow>
                <FieldLabel htmlFor="isDivisible">Divisibility</FieldLabel>
                <FieldSelect
                  id="isDivisible"
                  {...register('isDivisible', {
                    setValueAs: (v) => v === 'true',
                  })}
                >
                  <option value="false">Not Divisible</option>
                  <option value="true">Divisible</option>
                </FieldSelect>
              </FieldRow>
              {errors.isDivisible && (
                <StyledErrorMessage>
                  {errors.isDivisible.message}
                </StyledErrorMessage>
              )}
            </FieldWrapper>
          )}

          <FieldWrapper>
            <FieldRow>
              <FieldLabel htmlFor="fundingRound">Funding Round</FieldLabel>
              <FieldInput
                id="fundingRound"
                placeholder="Enter funding round (optional)"
                {...register('fundingRound')}
                $hasError={!!errors.fundingRound}
              />
            </FieldRow>
            {errors.fundingRound && (
              <StyledErrorMessage>
                {errors.fundingRound.message}
              </StyledErrorMessage>
            )}
          </FieldWrapper>
        </StyledFormSection>
      </StyledForm>

      <NavigationWrapper>
        <StepNavigation
          onNext={handleSubmit(onSubmit)}
          isFinalStep={isFinalStep}
          disabled={
            Object.keys(errors).length > 0 || isValidating || tickerValidating
          }
          isLoading={isLoading}
        />
      </NavigationWrapper>
    </FormContainer>
  );
};

export default BasicInfoStep;
