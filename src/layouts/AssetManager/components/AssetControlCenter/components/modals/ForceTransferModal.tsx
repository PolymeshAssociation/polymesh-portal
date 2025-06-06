import React, {
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { useForm } from 'react-hook-form';

import {
  NumberedPortfolio,
  DefaultPortfolio,
  Identity,
  ControllerTransferParams,
  NftControllerTransferParams,
} from '@polymeshassociation/polymesh-sdk/types';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { IAssetDetails } from '~/context/AssetContext/constants';
import { getPortfolioDataFromIdentity } from '~/components/LegSelect/helpers';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { notifyError } from '~/helpers/notifications';
import { parseCollectionsFromSinglePortfolio } from '~/components/AssetForm/helpers';
import { INft } from '~/components/AssetForm/constants';

import {
  ModalContainer,
  ModalContent,
  ModalActions,
  ModalActionsGrid,
  FieldActionButton,
  InputInfoNote,
  ErrorMessage,
  NftGrid,
  NftCard,
  NftImage,
  NftPlaceholder,
  NftIdLabel,
  NftLockedLabel,
} from '../../styles';
import {
  FieldWrapper,
  FieldLabel,
  FieldInput,
  FieldRow,
  FieldSelect,
  FieldInputWithButton,
} from '../../../CreateAssetWizard/styles';

interface ForceTransferFormData {
  targetDid: string;
  portfolioId: string;
  amount: string; // For fungible assets
  selectedNfts: BigNumber[]; // For NFT assets
}

interface ForceTransferModalProps {
  assetDetails: IAssetDetails;
  isOpen: boolean;
  onClose: () => void;
  controllerTransfer: (
    params: (ControllerTransferParams | NftControllerTransferParams) & {
      onTransactionRunning?: () => void | Promise<void>;
    },
  ) => Promise<void>;
  transactionInProcess: boolean;
}

export const ForceTransferModal: React.FC<ForceTransferModalProps> = ({
  assetDetails,
  isOpen,
  onClose,
  controllerTransfer,
  transactionInProcess,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const [targetIdentity, setTargetIdentity] = useState<Identity | null>(null);
  const [targetPortfolios, setTargetPortfolios] = useState<IPortfolioData[]>(
    [],
  );
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [identityError, setIdentityError] = useState('');

  // NFT-related state
  const [availableNfts, setAvailableNfts] = useState<INft[]>([]);
  const [nftsLoading, setNftsLoading] = useState(false);

  // Ref for auto-focusing the DID input
  const didInputRef = useRef<HTMLInputElement | null>(null);

  // Ref for tracking validation calls to prevent race conditions
  const validationCounterRef = useRef(0);

  // Ref for tracking portfolio loading calls to prevent race conditions
  const portfolioLoadingCounterRef = useRef(0);

  const isDivisible = useMemo(
    () => assetDetails?.details?.isDivisible ?? false,
    [assetDetails?.details?.isDivisible],
  );

  const isNftCollection = useMemo(
    () => assetDetails?.details?.isNftCollection ?? false,
    [assetDetails?.details?.isNftCollection],
  );

  const assetSymbol = useMemo(
    () => assetDetails?.details?.name || (isNftCollection ? 'NFTs' : 'tokens'),
    [assetDetails?.details?.name, isNftCollection],
  );

  // Initialize form
  const { register, handleSubmit, watch, reset, setValue } =
    useForm<ForceTransferFormData>({
      defaultValues: {
        targetDid: '',
        portfolioId: '',
        amount: '',
        selectedNfts: [],
      },
    });

  const watchedTargetDid = watch('targetDid');
  const watchedPortfolioId = watch('portfolioId');
  const watchedAmount = watch('amount');
  const watchedSelectedNfts = watch('selectedNfts');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        targetDid: '',
        portfolioId: '',
        amount: '',
        selectedNfts: [],
      });
      setTargetIdentity(null);
      setTargetPortfolios([]);
      setAvailableNfts([]);

      setIdentityError('');
      setPortfolioLoading(false);
      setNftsLoading(false);

      // Focus the DID input after a short delay to ensure modal is rendered
      setTimeout(() => {
        didInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, reset]);

  // Update portfolio selection when portfolios load
  useEffect(() => {
    if (!portfolioLoading && targetPortfolios.length > 0) {
      setValue('portfolioId', 'default');
    } else {
      // No portfolios available, clear selection
      setValue('portfolioId', '');
    }
  }, [targetPortfolios, watchedTargetDid, portfolioLoading, setValue]);

  // Clear amount/selected NFTs when portfolio changes
  useEffect(() => {
    setValue('amount', '');
    setValue('selectedNfts', []);
    setAvailableNfts([]);
  }, [watchedPortfolioId, setValue]);

  // Get selected portfolio and its balance
  const selectedPortfolio = useMemo(
    () =>
      targetPortfolios.find((portfolio) => portfolio.id === watchedPortfolioId),
    [targetPortfolios, watchedPortfolioId],
  );

  // Calculate available fungible asset balance
  const { availableBalance, lockedBalance } = useMemo(() => {
    if (!selectedPortfolio || !assetDetails.assetId) {
      return {
        availableBalance: new BigNumber(0),
        lockedBalance: new BigNumber(0),
      };
    }

    const portfolioBalance = selectedPortfolio.assets.find(
      (assetData) => assetData.asset.id === assetDetails.assetId,
    );
    return {
      availableBalance: portfolioBalance?.free || new BigNumber(0),
      lockedBalance: portfolioBalance?.locked || new BigNumber(0),
    };
  }, [selectedPortfolio, assetDetails?.assetId]);

  // Fungible asset amount validation
  const amountError = useMemo(() => {
    if (!watchedAmount) return undefined;

    try {
      const amount = new BigNumber(watchedAmount);

      if (amount.lte(0)) {
        return 'Amount must be greater than 0';
      }

      if (!isDivisible && !amount.isInteger()) {
        return 'Amount must be a whole number for indivisible assets';
      }

      if (isDivisible && amount.decimalPlaces() > 6) {
        return 'Maximum 6 decimal places allowed';
      }

      if (amount.gt(availableBalance)) {
        return 'Amount exceeds available balance';
      }

      return undefined;
    } catch {
      return 'Invalid amount format';
    }
  }, [watchedAmount, isDivisible, availableBalance]);

  // Validate DID
  const validateDid = useCallback(
    async (did: string) => {
      // Increment counter and get current validation ID
      validationCounterRef.current += 1;
      const validationId = validationCounterRef.current;

      if (!did.length) {
        setIdentityError('DID is required');
        return false;
      }

      if (!/^0x[0-9a-fA-F]{64}$/.test(did)) {
        setIdentityError('DID must be valid');
        return false;
      }

      if (!sdk) {
        setIdentityError('SDK not available');
        return false;
      }

      try {
        const isValid = await sdk.identities.isIdentityValid({ identity: did });

        // Only update state if this is still the latest validation
        if (validationId === validationCounterRef.current) {
          if (!isValid) {
            setIdentityError('Identity does not exist');
            return false;
          }

          setIdentityError('');
          return true;
        }

        // Return the validation result even if we don't update state
        return isValid;
      } catch (error) {
        if (validationId === validationCounterRef.current) {
          setIdentityError('Failed to validate identity');
        }
        return false;
      }
    },
    [sdk],
  );

  // Handle DID input blur
  const handleDidBlur = useCallback(
    async (did: string) => {
      if (!sdk) return;

      const trimmedDid = did.trim();

      // Increment counter and get current call ID
      portfolioLoadingCounterRef.current += 1;
      const callId = portfolioLoadingCounterRef.current;

      const isValid = await validateDid(trimmedDid);

      // Only proceed if this is still the latest call
      if (callId !== portfolioLoadingCounterRef.current) return;

      if (!isValid) {
        setTargetIdentity(null);
        setTargetPortfolios([]);
        return;
      }

      // Check if it's the same identity
      if (targetIdentity?.did === trimmedDid) return;

      try {
        setPortfolioLoading(true);

        const identity = await sdk.identities.getIdentity({ did: trimmedDid });
        const portfolios = await getPortfolioDataFromIdentity(
          identity,
          assetDetails.assetId,
        );

        // Only update state if this is still the latest call
        if (callId === portfolioLoadingCounterRef.current) {
          setTargetIdentity(identity);
          setTargetPortfolios(portfolios);
          setPortfolioLoading(false);
        }
      } catch (error) {
        if (callId === portfolioLoadingCounterRef.current) {
          notifyError((error as Error).message);
          setTargetIdentity(null);
          setTargetPortfolios([]);
          setPortfolioLoading(false);
        }
      }
    },
    [sdk, validateDid, targetIdentity?.did, assetDetails.assetId],
  );

  // Handle max button click
  const handleMaxClick = useCallback(() => {
    const maxAmount = isDivisible
      ? availableBalance.toString()
      : availableBalance.toString();
    setValue('amount', maxAmount);
  }, [availableBalance, isDivisible, setValue]);

  const handleModalClose = useCallback(() => {
    reset();
    setTargetIdentity(null);
    setTargetPortfolios([]);
    setIdentityError('');
    setPortfolioLoading(false);
    setNftsLoading(false);
    setAvailableNfts([]);
    onClose();
  }, [reset, onClose]);

  const onSubmit = async (data: ForceTransferFormData) => {
    if (!selectedPortfolio) return;

    if (isNftCollection) {
      // NFT transfer
      if (!data.selectedNfts || data.selectedNfts.length === 0) return;

      await controllerTransfer({
        nfts: data.selectedNfts,
        originPortfolio: selectedPortfolio.portfolio,
        onTransactionRunning: handleModalClose,
      });
    } else {
      // Fungible token transfer
      if (!data.amount) return;
      const amount = new BigNumber(data.amount);

      await controllerTransfer({
        amount,
        originPortfolio: selectedPortfolio.portfolio,
        onTransactionRunning: handleModalClose,
      });
    }
  };

  const isFormValid = useMemo(() => {
    const baseValid = watchedTargetDid && watchedPortfolioId && !identityError;

    if (isNftCollection) {
      return baseValid && watchedSelectedNfts && watchedSelectedNfts.length > 0;
    }
    return baseValid && watchedAmount && !amountError;
  }, [
    watchedTargetDid,
    watchedPortfolioId,
    identityError,
    isNftCollection,
    watchedSelectedNfts,
    watchedAmount,
    amountError,
  ]);

  // Handle NFT selection
  const handleSelectNft = useCallback(
    (nft: INft) => {
      const currentNfts = watchedSelectedNfts;
      const isSelected = currentNfts.some((id) => id.eq(nft.id));

      if (isSelected) {
        // Remove NFT
        const newNfts = currentNfts.filter((id) => !id.eq(nft.id));
        setValue('selectedNfts', newNfts);
      } else {
        // Add NFT
        setValue('selectedNfts', [...currentNfts, nft.id]);
      }
    },
    [watchedSelectedNfts, setValue],
  );

  const handleSelectAllNfts = useCallback(() => {
    const unlocked = availableNfts.filter((nft) => !nft.locked);
    setValue(
      'selectedNfts',
      unlocked.map((nft) => nft.id),
    );
  }, [availableNfts, setValue]);

  const handleClearAllNfts = useCallback(() => {
    setValue('selectedNfts', []);
  }, [setValue]);

  // Load NFTs when portfolio is selected and asset is NFT collection
  useEffect(() => {
    let isCurrent = true; // Flag to track if this effect is still current

    const loadNfts = async () => {
      if (!selectedPortfolio || !isNftCollection || !assetDetails.assetId) {
        setAvailableNfts([]);
        setNftsLoading(false);
        return;
      }

      try {
        setNftsLoading(true);
        const { nfts } = await parseCollectionsFromSinglePortfolio(
          selectedPortfolio.portfolio as DefaultPortfolio | NumberedPortfolio,
          assetDetails.assetId,
        );

        // Only update state if this effect is still current
        if (isCurrent) {
          // Get NFTs for the current asset
          const assetNfts = nfts[assetDetails.assetId] || [];
          setAvailableNfts(assetNfts);
          setNftsLoading(false);
        }
      } catch (error) {
        if (isCurrent) {
          notifyError('Failed to load NFTs');
          setAvailableNfts([]);
          setNftsLoading(false);
        }
      }
    };

    loadNfts();

    // Cleanup function to mark this effect as stale
    return () => {
      isCurrent = false;
    };
  }, [selectedPortfolio, isNftCollection, assetDetails.assetId]);

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleModalClose} customWidth="600px">
      <ModalContainer>
        <Heading type="h4">Force Transfer</Heading>

        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Target DID Input */}
            <FieldWrapper>
              <FieldRow>
                <FieldLabel>Target DID</FieldLabel>
                <FieldInput
                  type="text"
                  placeholder="Enter target DID"
                  disabled={transactionInProcess}
                  name={register('targetDid').name}
                  onChange={register('targetDid').onChange}
                  onBlur={(e) => {
                    register('targetDid').onBlur(e);
                    handleDidBlur(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                  ref={(e) => {
                    register('targetDid').ref(e);
                    didInputRef.current = e;
                  }}
                />
              </FieldRow>
              {identityError && <ErrorMessage>{identityError}</ErrorMessage>}
            </FieldWrapper>

            {/* Portfolio Selection */}
            <FieldWrapper>
              <FieldRow>
                <FieldLabel>Target Portfolio</FieldLabel>
                <FieldSelect
                  disabled={
                    transactionInProcess ||
                    portfolioLoading ||
                    !targetIdentity ||
                    !!identityError
                  }
                  name={register('portfolioId').name}
                  onChange={register('portfolioId').onChange}
                  onBlur={register('portfolioId').onBlur}
                  ref={register('portfolioId').ref}
                >
                  {/* Show placeholder when no portfolios are available */}
                  {targetPortfolios.length === 0 && (
                    <option value="" disabled>
                      {(() => {
                        if (portfolioLoading) return 'Loading portfolios...';
                        if (!targetIdentity || identityError)
                          return 'Enter valid DID first';
                        return 'No portfolios available';
                      })()}
                    </option>
                  )}

                  {/* Show actual portfolios when available */}
                  {targetPortfolios.map((portfolio) => (
                    <option key={portfolio.id} value={portfolio.id}>
                      {portfolio.id === 'default'
                        ? 'Default Portfolio'
                        : `${portfolio.id} - ${portfolio.name}`}
                    </option>
                  ))}
                </FieldSelect>
              </FieldRow>
            </FieldWrapper>

            {/* Conditional Input - Amount for Fungible, NFT Selection for NFT Collections */}
            {isNftCollection ? (
              <>
                {/* NFT Selection */}
                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel>Select NFTs to Transfer</FieldLabel>
                    <FieldInputWithButton>
                      <FieldActionButton
                        disabled={
                          nftsLoading ||
                          availableNfts.filter((nft) => !nft.locked).length ===
                            0 ||
                          transactionInProcess
                        }
                        onClick={handleSelectAllNfts}
                      >
                        Select All
                      </FieldActionButton>
                      <FieldActionButton
                        disabled={
                          watchedSelectedNfts.length === 0 ||
                          nftsLoading ||
                          transactionInProcess
                        }
                        onClick={handleClearAllNfts}
                      >
                        Clear All
                      </FieldActionButton>
                    </FieldInputWithButton>
                  </FieldRow>

                  {watchedSelectedNfts.length > 0 && (
                    <InputInfoNote>
                      Selected: {watchedSelectedNfts.length} NFT
                      {watchedSelectedNfts.length !== 1 ? 's' : ''}
                    </InputInfoNote>
                  )}
                </FieldWrapper>
                <FieldWrapper>
                  {(() => {
                    if (nftsLoading) {
                      return <InputInfoNote>Loading NFTs...</InputInfoNote>;
                    }
                    if (availableNfts.length > 0) {
                      return (
                        <NftGrid>
                          {availableNfts
                            .sort((a, b) => a.id.toNumber() - b.id.toNumber())
                            .map((nft) => {
                              const isSelected = watchedSelectedNfts.some(
                                (id) => id.eq(nft.id),
                              );
                              return (
                                <NftCard
                                  key={nft.id.toString()}
                                  type="button"
                                  $isSelected={isSelected}
                                  $isLocked={nft.locked}
                                  disabled={nft.locked}
                                  onClick={() =>
                                    !nft.locked && handleSelectNft(nft)
                                  }
                                >
                                  {nft.imgUrl ? (
                                    <NftImage
                                      src={nft.imgUrl}
                                      alt={`NFT ${nft.id.toString()}`}
                                    />
                                  ) : (
                                    <NftPlaceholder>
                                      #{nft.id.toString()}
                                    </NftPlaceholder>
                                  )}
                                  <NftIdLabel $isSelected={isSelected}>
                                    ID: {nft.id.toString()}
                                  </NftIdLabel>
                                  {nft.locked && (
                                    <NftLockedLabel>Locked</NftLockedLabel>
                                  )}
                                </NftCard>
                              );
                            })}
                        </NftGrid>
                      );
                    }
                    return (
                      <InputInfoNote>
                        No NFTs available for transfer
                      </InputInfoNote>
                    );
                  })()}
                </FieldWrapper>
              </>
            ) : (
              /* Amount Input for Fungible Assets */
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Amount to Transfer</FieldLabel>
                  <FieldInputWithButton>
                    <FieldInput
                      type="text"
                      placeholder="Enter token amount"
                      disabled={
                        transactionInProcess ||
                        availableBalance.eq(0) ||
                        !watchedPortfolioId ||
                        portfolioLoading ||
                        !targetIdentity ||
                        !!identityError
                      }
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      onInput={(e: React.FormEvent<HTMLInputElement>) => {
                        const input = e.currentTarget;
                        if (isDivisible) {
                          input.value = input.value.replace(/[^\d.]/g, '');
                        } else {
                          input.value = input.value.replace(/[^\d]/g, '');
                        }
                      }}
                      name={register('amount').name}
                      onChange={register('amount').onChange}
                      onBlur={register('amount').onBlur}
                      ref={register('amount').ref}
                    />
                    <FieldActionButton
                      type="button"
                      disabled={
                        transactionInProcess ||
                        availableBalance.eq(0) ||
                        !watchedPortfolioId ||
                        portfolioLoading ||
                        !targetIdentity ||
                        !!identityError
                      }
                      onClick={handleMaxClick}
                    >
                      Max
                    </FieldActionButton>
                  </FieldInputWithButton>
                </FieldRow>

                {/* Validation Error */}
                {amountError && <ErrorMessage>{amountError}</ErrorMessage>}

                {/* Balance Information - Only show when portfolio is selected and valid */}
                {watchedPortfolioId &&
                  targetIdentity &&
                  !identityError &&
                  !portfolioLoading && (
                    <>
                      <InputInfoNote>
                        Available: {availableBalance.toString()} {assetSymbol}
                      </InputInfoNote>
                      {lockedBalance?.gt(0) && (
                        <InputInfoNote>
                          Locked: {lockedBalance.toString()} {assetSymbol}
                        </InputInfoNote>
                      )}
                    </>
                  )}
              </FieldWrapper>
            )}

            <ModalActions>
              <ModalActionsGrid>
                <Button
                  variant="modalSecondary"
                  onClick={handleModalClose}
                  disabled={transactionInProcess}
                >
                  Cancel
                </Button>
                <Button
                  variant="modalPrimary"
                  onClick={handleSubmit(onSubmit)}
                  disabled={!isFormValid || transactionInProcess}
                >
                  Force Transfer
                </Button>
              </ModalActionsGrid>
            </ModalActions>
          </form>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
