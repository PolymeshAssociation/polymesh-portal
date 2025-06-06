/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { LinkTickerToAssetParams } from '@polymeshassociation/polymesh-sdk/types';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { IAssetDetails } from '~/context/AssetContext/constants';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AssetContext } from '~/context/AssetContext';

import { ModalContainer, ModalContent, ModalActions } from '../../styles';
import {
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldWrapper,
  StyledErrorMessage,
} from '../../../CreateAssetWizard/styles';

interface ILinkTickerForm {
  ticker: string;
}

interface ILinkTickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: IAssetDetails;
  onLinkTicker: (
    params: LinkTickerToAssetParams & {
      onTransactionRunning?: () => void | Promise<void>;
    },
  ) => Promise<void>;
  transactionInProcess: boolean;
}

export const LinkTickerModal: React.FC<ILinkTickerModalProps> = ({
  isOpen,
  onClose,
  onLinkTicker,
  transactionInProcess,
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
    setError,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<ILinkTickerForm>({
    mode: 'onChange',
    defaultValues: {
      ticker: '',
    },
  });

  const watchedTicker = watch('ticker');

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

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (formData: ILinkTickerForm) => {
      const ticker = formData.ticker.trim().toUpperCase();
      await onLinkTicker({
        ticker,
        onTransactionRunning: handleClose,
      });
    },
    [onLinkTicker, handleClose],
  );

  const isFormValid = useMemo(() => {
    return (
      !errors.ticker &&
      !tickerValidating &&
      watchedTicker &&
      watchedTicker.trim().length > 0
    );
  }, [errors.ticker, tickerValidating, watchedTicker]);

  // Ticker validation effect - immediate validation for basic checks, debounced for chain call
  useEffect(() => {
    const ticker = watchedTicker?.trim().toUpperCase();

    // Early return if no ticker or basic validation fails
    if (!ticker || ticker === '') {
      setTickerValidating(false);
      return undefined;
    }

    // Don't check availability if basic validation fails (form validation will handle errors)
    if (ticker.length > 12 || !/^[A-Z0-9_\-./]*$/.test(ticker)) {
      setTickerValidating(false);
      return undefined;
    }

    // Only debounce the chain call for ticker availability
    const currentToken = validationTokenRef.current + 1;
    validationTokenRef.current = currentToken;

    setTickerValidating(true);

    const checkTickerAvailability = async () => {
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
        checkTickerAvailability();
      }
    }, 300);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [watchedTicker, isTickerAvailable, setError, clearErrors]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        ticker: '',
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Link Ticker to Asset
          </Heading>

          <Text marginBottom={24} color="secondary">
            Link a ticker symbol to this asset. The ticker must be available or
            reserved by you.
          </Text>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Ticker Symbol</FieldLabel>
              <FieldInput
                type="text"
                placeholder="Enter ticker symbol"
                $hasError={!!errors.ticker}
                disabled={transactionInProcess}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  // Convert to uppercase and filter allowed characters
                  const target = e.target as HTMLInputElement;
                  target.value = target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9_\-./]/g, '');
                }}
                {...register('ticker', {
                  required: 'Ticker is required',
                  maxLength: {
                    value: 12,
                    message: 'Ticker must be less than 12 characters',
                  },
                  pattern: {
                    value: /^[A-Z0-9_\-./]*$/,
                    message:
                      'Ticker can only contain alphanumeric values, "_", "-", ".", and "/"',
                  },
                })}
              />
            </FieldRow>

            {errors.ticker && (
              <StyledErrorMessage>{errors.ticker.message}</StyledErrorMessage>
            )}
          </FieldWrapper>

          <ModalActions>
            <Button
              variant="modalSecondary"
              onClick={handleClose}
              disabled={transactionInProcess}
            >
              Cancel
            </Button>
            <Button
              variant="modalPrimary"
              onClick={handleSubmit(onSubmit)}
              disabled={
                !isFormValid || transactionInProcess || tickerValidating
              }
            >
              Link Ticker
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
