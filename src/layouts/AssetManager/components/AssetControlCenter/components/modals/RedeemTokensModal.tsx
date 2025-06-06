import React, {
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { useForm } from 'react-hook-form';

import {
  NumberedPortfolio,
  DefaultPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { PortfolioContext } from '~/context/PortfolioContext';
import { IAssetDetails } from '~/context/AssetContext/constants';
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
  FieldSelect,
  FieldInput,
  FieldRow,
  FieldInputWithButton,
} from '../../../CreateAssetWizard/styles';

interface RedeemFormData {
  amount: string;
  portfolioId: string;
  selectedNfts: BigNumber[];
}

interface RedeemTokensModalProps {
  assetDetails: IAssetDetails;
  isOpen: boolean;
  onClose: () => void;
  redeemTokens: (params: {
    amount: BigNumber;
    from: NumberedPortfolio | DefaultPortfolio;
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  redeemNfts: (params: {
    nftIds: BigNumber[];
    from: NumberedPortfolio | DefaultPortfolio;
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

export const RedeemTokensModal: React.FC<RedeemTokensModalProps> = ({
  assetDetails,
  isOpen,
  onClose,
  redeemTokens,
  redeemNfts,
  transactionInProcess,
}) => {
  const { allPortfolios } = useContext(PortfolioContext);

  // NFT-related state
  const [availableNfts, setAvailableNfts] = useState<INft[]>([]);
  const [nftsLoading, setNftsLoading] = useState(false);

  const isNftCollection = useMemo(
    () => assetDetails?.details?.isNftCollection ?? false,
    [assetDetails?.details?.isNftCollection],
  );

  const isDivisible = useMemo(
    () => assetDetails?.details?.isDivisible ?? true,
    [assetDetails?.details?.isDivisible],
  );

  const assetSymbol = useMemo(
    () => assetDetails?.details?.name || (isNftCollection ? 'NFTs' : 'tokens'),
    [assetDetails?.details?.name, isNftCollection],
  );

  // Initialize form with default portfolio selected
  const { register, handleSubmit, watch, reset, setValue } =
    useForm<RedeemFormData>({
      defaultValues: {
        amount: '',
        portfolioId: 'default',
        selectedNfts: [],
      },
    });

  // Reset form to defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        amount: '',
        portfolioId: 'default',
        selectedNfts: [],
      });
    }
  }, [isOpen, reset]);

  const watchedAmount = watch('amount');
  const watchedPortfolioId = watch('portfolioId');
  const watchedSelectedNfts = watch('selectedNfts');

  // Clear amount and NFTs when portfolio changes
  useEffect(() => {
    setValue('amount', '');
    setValue('selectedNfts', []);
  }, [watchedPortfolioId, setValue]);

  // Get selected portfolio and its balance - memoized for performance
  const selectedPortfolio = useMemo(
    () =>
      allPortfolios.find((portfolio) => portfolio.id === watchedPortfolioId),
    [allPortfolios, watchedPortfolioId],
  );

  // Calculate available balance - memoized for performance
  const { availableBalance, lockedBalance } = useMemo(() => {
    if (!selectedPortfolio || !assetDetails?.assetId) {
      return {
        availableBalance: new BigNumber(0),
        lockedBalance: new BigNumber(0),
      };
    }

    const portfolioBalance = selectedPortfolio.assets.find(
      (assetData) => assetData.asset.toHuman() === assetDetails.assetId,
    );
    return {
      availableBalance: portfolioBalance?.free || new BigNumber(0),
      lockedBalance: portfolioBalance?.locked || new BigNumber(0),
    };
  }, [selectedPortfolio, assetDetails?.assetId]);

  // Load NFTs for the selected portfolio when it's an NFT collection
  useEffect(() => {
    if (!isNftCollection || !selectedPortfolio || !assetDetails?.assetId) {
      setAvailableNfts([]);
      return;
    }

    const loadNfts = async () => {
      setNftsLoading(true);
      try {
        const { nfts } = await parseCollectionsFromSinglePortfolio(
          selectedPortfolio.portfolio as DefaultPortfolio | NumberedPortfolio,
          assetDetails.assetId,
        );

        // Get NFTs for the current asset
        const assetNfts = nfts[assetDetails.assetId] || [];
        setAvailableNfts(assetNfts);
      } catch (error) {
        setAvailableNfts([]);
      } finally {
        setNftsLoading(false);
      }
    };

    loadNfts();
  }, [isNftCollection, selectedPortfolio, assetDetails?.assetId]);

  // NFT selection handler
  const handleSelectNft = useCallback(
    (nft: INft) => {
      const currentNfts = watchedSelectedNfts || [];
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

  // Amount validation - memoized for performance
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

  // Handle max button click - memoized for performance
  const handleMaxClick = useCallback(() => {
    const maxAmount = isDivisible
      ? availableBalance.toString()
      : availableBalance.toString();
    setValue('amount', maxAmount);
  }, [availableBalance, isDivisible, setValue]);

  const handleModalClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = async (data: RedeemFormData) => {
    if (!selectedPortfolio) return;

    if (isNftCollection) {
      // NFT redemption
      if (!data.selectedNfts?.length) return;

      redeemNfts({
        from: selectedPortfolio.portfolio,
        nftIds: data.selectedNfts,
        onTransactionRunning: handleModalClose,
      });
    } else {
      // Fungible token redemption
      if (!data.amount) return;

      const amount = new BigNumber(data.amount);

      redeemTokens({
        from: selectedPortfolio.portfolio,
        amount,
        onTransactionRunning: handleModalClose,
      });
    }
  };

  const isFormValid = isNftCollection
    ? watchedPortfolioId && watchedSelectedNfts?.length > 0
    : watchedPortfolioId && watchedAmount && !amountError;

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleModalClose} customWidth="600px">
      <ModalContainer>
        <Heading type="h4">
          Redeem {isNftCollection ? 'NFTs' : 'Tokens'}
        </Heading>

        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Portfolio Selection */}
            <FieldWrapper>
              <FieldRow>
                <FieldLabel>From Portfolio</FieldLabel>
                <FieldSelect
                  disabled={transactionInProcess}
                  name={register('portfolioId').name}
                  onChange={register('portfolioId').onChange}
                  onBlur={register('portfolioId').onBlur}
                  ref={register('portfolioId').ref}
                >
                  {allPortfolios.map((portfolio) => (
                    <option key={portfolio.id} value={portfolio.id}>
                      {portfolio.id === 'default'
                        ? 'Default Portfolio'
                        : `${portfolio.id} - ${portfolio.name}`}
                    </option>
                  ))}
                </FieldSelect>
              </FieldRow>
            </FieldWrapper>

            {/* Conditional Content: Amount Input for Fungible, NFT Grid for NFTs */}
            {isNftCollection ? (
              <>
                {/* NFT Selection Controls */}
                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel>Select NFTs to Redeem</FieldLabel>
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
                          !watchedSelectedNfts?.length ||
                          nftsLoading ||
                          transactionInProcess
                        }
                        onClick={handleClearAllNfts}
                      >
                        Clear All
                      </FieldActionButton>
                    </FieldInputWithButton>
                  </FieldRow>

                  {watchedSelectedNfts?.length > 0 && (
                    <InputInfoNote>
                      Selected: {watchedSelectedNfts.length} NFT
                      {watchedSelectedNfts.length !== 1 ? 's' : ''}
                    </InputInfoNote>
                  )}
                </FieldWrapper>

                {/* NFT Grid */}
                <FieldWrapper>
                  {nftsLoading && (
                    <InputInfoNote>Loading NFTs...</InputInfoNote>
                  )}
                  {!nftsLoading && availableNfts.length > 0 && (
                    <NftGrid>
                      {availableNfts
                        .sort((a, b) => a.id.toNumber() - b.id.toNumber())
                        .map((nft) => {
                          const isSelected =
                            watchedSelectedNfts?.some((id) => id.eq(nft.id)) ??
                            false;
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
                              <div>
                                <NftIdLabel $isSelected={isSelected}>
                                  ID: {nft.id.toString()}
                                </NftIdLabel>
                                {nft.locked && (
                                  <NftLockedLabel>Locked</NftLockedLabel>
                                )}
                              </div>
                            </NftCard>
                          );
                        })}
                    </NftGrid>
                  )}
                  {!nftsLoading && availableNfts.length === 0 && (
                    <InputInfoNote>
                      No NFTs available for redemption
                    </InputInfoNote>
                  )}
                </FieldWrapper>
              </>
            ) : (
              /* Amount Input for Fungible Assets */
              <FieldWrapper>
                <FieldRow>
                  <FieldLabel>Amount to Redeem</FieldLabel>
                  <FieldInputWithButton>
                    <FieldInput
                      type="text"
                      placeholder="Enter token amount"
                      disabled={transactionInProcess}
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
                      disabled={transactionInProcess || availableBalance.eq(0)}
                      onClick={handleMaxClick}
                    >
                      Max
                    </FieldActionButton>
                  </FieldInputWithButton>
                </FieldRow>

                {/* Validation Error */}
                {amountError && <ErrorMessage>{amountError}</ErrorMessage>}

                {/* Balance Information */}
                {watchedPortfolioId && (
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
          </form>

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
                Redeem {isNftCollection ? 'NFTs' : 'Tokens'}
              </Button>
            </ModalActionsGrid>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
