/* eslint-disable react/jsx-props-no-spreading */
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import type { NftMetadataInput } from '@polymeshassociation/polymesh-sdk/types';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { Icon, Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { IAssetDetails } from '~/context/AssetContext/constants';
import { PortfolioContext } from '~/context/PortfolioContext';
import { parseCsv } from '~/helpers/csv';

import {
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldWrapper,
  StyledErrorMessage,
} from '../../../CreateAssetWizard/styles';
import { ModalActions, ModalContainer, ModalContent } from '../../styles';

interface ISingleNftForm {
  [key: string]: string;
}

interface IBatchNftForm {
  batchSize: number;
}

interface IMintNftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: IAssetDetails;
  onMintNft: (params: {
    metadata: NftMetadataInput[];
    portfolioId?: BigNumber;
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  onMintNftBatch: (params: {
    nftsMetadata: NftMetadataInput[][];
    portfolioId?: BigNumber;
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

enum MintMode {
  SINGLE = 'single',
  BATCH = 'batch',
}

const MAX_BATCH_SIZE = 25;

export const MintNftsModal: React.FC<IMintNftsModalProps> = ({
  isOpen,
  onClose,
  asset,
  onMintNft,
  onMintNftBatch,
  transactionInProcess,
}) => {
  const { allPortfolios } = useContext(PortfolioContext);
  const [mintMode, setMintMode] = useState<MintMode>(MintMode.SINGLE);
  const [csvData, setCsvData] = useState<{ [key: string]: string }[]>([]);
  const [csvError, setCsvError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPortfolioId, setSelectedPortfolioId] =
    useState<string>('default');

  const collectionKeys = useMemo(
    () => asset?.details?.collectionKeys || [],
    [asset?.details?.collectionKeys],
  );
  const hasCollectionKeys = collectionKeys.length > 0;

  const buildFieldKey = useCallback(
    (k: { type: string; id: { toString(): string } }) =>
      `${k.type}:${k.id.toString()}`,
    [],
  );
  const buildCsvHeaderKey = useCallback(
    (k: { type: string; id: { toString(): string }; name: string }) =>
      `${k.type}:${k.id.toString()}:${k.name}`,
    [],
  );

  // Form for single NFT minting
  const {
    register: registerSingle,
    handleSubmit: handleSubmitSingle,
    formState: { errors: singleErrors },
    reset: resetSingle,
  } = useForm<ISingleNftForm>({
    mode: 'onChange',
  });

  // Form for batch NFT minting
  const {
    register: registerBatch,
    handleSubmit: handleSubmitBatch,
    watch: watchBatch,
    formState: { errors: batchErrors },
    reset: resetBatch,
  } = useForm<IBatchNftForm>({
    mode: 'onChange',
    defaultValues: {
      batchSize: 1,
    },
  });

  const watchedBatchSize = watchBatch('batchSize');

  // Reset forms when modal opens
  useEffect(() => {
    if (isOpen) {
      resetSingle();
      resetBatch();
      setCsvData([]);
      setCsvError('');
      setMintMode(MintMode.SINGLE);
      setSelectedPortfolioId('default');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, resetSingle, resetBatch]);

  // Reset forms when switching modes
  useEffect(() => {
    resetSingle();
    resetBatch();
    setCsvData([]);
    setCsvError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [mintMode, resetSingle, resetBatch]);

  const handleClose = useCallback(() => {
    resetSingle();
    resetBatch();
    setCsvData([]);
    setCsvError('');
    setMintMode(MintMode.SINGLE);
    setSelectedPortfolioId('default');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  }, [resetSingle, resetBatch, onClose]);

  const selectedPortfolio = useMemo(
    () => allPortfolios.find((p) => p.id === selectedPortfolioId),
    [allPortfolios, selectedPortfolioId],
  );

  const selectedPortfolioIdAsBigNumber = useMemo(() => {
    if (selectedPortfolio && 'id' in selectedPortfolio.portfolio) {
      return selectedPortfolio.portfolio.id;
    }
    // Return `undefined` for the DefaultPortfolio
    return undefined;
  }, [selectedPortfolio]);

  const onSubmitSingle = useCallback(
    async (formData: ISingleNftForm) => {
      const metadata: NftMetadataInput[] = hasCollectionKeys
        ? collectionKeys.map((key) => ({
            type: key.type,
            id: key.id,
            value: formData[buildFieldKey(key)] || '',
          }))
        : [];

      await onMintNft({
        metadata,
        portfolioId: selectedPortfolioIdAsBigNumber,
        onTransactionRunning: handleClose,
      });
    },
    [
      onMintNft,
      handleClose,
      hasCollectionKeys,
      collectionKeys,
      selectedPortfolioIdAsBigNumber,
      buildFieldKey,
    ],
  );

  const onSubmitBatch = useCallback(
    async (formData: IBatchNftForm) => {
      let nftsMetadata: NftMetadataInput[][];

      if (hasCollectionKeys) {
        if (csvData.length === 0) {
          return;
        }
        nftsMetadata = csvData.map((row) =>
          collectionKeys.map((key) => ({
            type: key.type,
            id: key.id,
            value: row[buildCsvHeaderKey(key)] || '',
          })),
        );
      } else {
        nftsMetadata = Array.from({ length: formData.batchSize }, () => []);
      }

      await onMintNftBatch({
        nftsMetadata,
        portfolioId: selectedPortfolioIdAsBigNumber,
        onTransactionRunning: handleClose,
      });
    },
    [
      onMintNftBatch,
      handleClose,
      hasCollectionKeys,
      csvData,
      collectionKeys,
      selectedPortfolioIdAsBigNumber,
      buildCsvHeaderKey,
    ],
  );

  const generateCsvTemplate = useCallback(() => {
    if (collectionKeys.length === 0) return;

    const headers = collectionKeys.map((key) => buildCsvHeaderKey(key));
    const csvContent = `${headers.join(',')}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${asset.assetId}_nft_template.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [collectionKeys, asset, buildCsvHeaderKey]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const raw = (e.target?.result as string) ?? '';
          const requiredHeaders = collectionKeys.map((k) =>
            buildCsvHeaderKey(k),
          );
          const { rows } = parseCsv(raw, requiredHeaders, {
            maxRows: MAX_BATCH_SIZE,
            requireNonEmptyValues: true,
          });
          setCsvData(rows);
          setCsvError('');
        } catch (error) {
          setCsvError(`Error parsing CSV: ${(error as Error).message}`);
          setCsvData([]);
        }
      };

      reader.readAsText(file);
    },
    [collectionKeys, buildCsvHeaderKey],
  );

  const clearCsvFile = useCallback(() => {
    setCsvData([]);
    setCsvError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const primaryButtonLabel = useMemo(() => {
    if (mintMode === MintMode.SINGLE) return 'Mint NFT';
    if (hasCollectionKeys) {
      const count = csvData.length;
      return `Mint ${count} NFT${count === 1 ? '' : 's'}`;
    }
    const count = watchedBatchSize || 1;
    return `Mint ${count} NFT${count === 1 ? '' : 's'}`;
  }, [mintMode, hasCollectionKeys, csvData.length, watchedBatchSize]);

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="700px">
      <ModalContainer>
        <ModalContent key={`mint-modal-${mintMode}`}>
          <Heading type="h4" marginBottom={24}>
            Mint NFTs
          </Heading>

          {/* Destination Portfolio */}
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Destination Portfolio</FieldLabel>
              <FieldSelect
                value={selectedPortfolioId}
                onChange={(e) => setSelectedPortfolioId(e.target.value)}
                disabled={transactionInProcess}
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

          {/* Mode Selection */}
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Minting Mode</FieldLabel>
              <FieldSelect
                value={mintMode}
                onChange={(e) => setMintMode(e.target.value as MintMode)}
                disabled={transactionInProcess}
              >
                <option value={MintMode.SINGLE}>Single NFT</option>
                <option value={MintMode.BATCH}>Multiple NFTs</option>
              </FieldSelect>
            </FieldRow>
          </FieldWrapper>

          {mintMode === MintMode.SINGLE ? (
            /* Single NFT Form */
            <div key="single-nft-form">
              <Text marginBottom={16} color="secondary">
                {hasCollectionKeys
                  ? 'Enter values for each collection key. All fields are required.'
                  : 'This collection has no predefined keys. The NFT will be minted with only an ID.'}
              </Text>

              {hasCollectionKeys && (
                <>
                  {collectionKeys.map((key) => {
                    const fieldKey = buildFieldKey(key);
                    return (
                      <FieldWrapper key={fieldKey}>
                        <FieldRow>
                          <FieldLabel>
                            {key.type === 'Global'
                              ? `Global ${key.id.toString()}`
                              : key.id.toString()}{' '}
                            - {key.name}
                          </FieldLabel>
                          <FieldInput
                            type="text"
                            placeholder={`Enter ${key.name}`}
                            disabled={transactionInProcess}
                            $hasError={!!singleErrors[fieldKey]}
                            {...registerSingle(fieldKey, {
                              required: `${key.name} is required`,
                            })}
                          />
                        </FieldRow>
                        {singleErrors[fieldKey] && (
                          <StyledErrorMessage>
                            {
                              (singleErrors[fieldKey] as { message?: string })
                                ?.message
                            }
                          </StyledErrorMessage>
                        )}
                      </FieldWrapper>
                    );
                  })}
                </>
              )}
            </div>
          ) : (
            /* Batch NFT Form */
            <div key="batch-nft-form">
              <Text marginBottom={16} color="secondary">
                {hasCollectionKeys
                  ? 'Upload a CSV file with NFT metadata.'
                  : `Specify the number of NFTs to mint (maximum ${MAX_BATCH_SIZE}).`}
              </Text>

              {hasCollectionKeys && (
                <>
                  {/* CSV Template Download */}
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel>CSV Template</FieldLabel>
                      <Button
                        variant="outline"
                        onClick={generateCsvTemplate}
                        disabled={transactionInProcess}
                      >
                        <Icon name="DownloadIcon" />
                        Download Template
                      </Button>
                    </FieldRow>
                  </FieldWrapper>

                  {/* CSV File Upload */}
                  <FieldWrapper>
                    <FieldRow>
                      <FieldLabel>Upload CSV</FieldLabel>
                      <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                        <FieldInput
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          disabled={transactionInProcess}
                          style={{ flex: 1 }}
                        />
                        {(csvData.length > 0 || !!csvError) && (
                          <Button
                            variant="outline"
                            onClick={clearCsvFile}
                            disabled={transactionInProcess}
                            square
                            aria-label="Clear uploaded CSV"
                          >
                            <Icon name="Delete" size="16px" />
                          </Button>
                        )}
                      </div>
                    </FieldRow>
                    {csvError && (
                      <StyledErrorMessage>{csvError}</StyledErrorMessage>
                    )}
                    {csvData.length > 0 && (
                      <Text size="small" color="secondary" marginTop={4}>
                        ✓ {csvData.length} NFT{csvData.length > 1 ? 's' : ''}{' '}
                        ready to mint
                      </Text>
                    )}
                  </FieldWrapper>
                </>
              )}

              {/* Batch Size Input (only when there are no collection keys) */}
              {!hasCollectionKeys && (
                <FieldWrapper>
                  <FieldRow>
                    <FieldLabel>Number of NFTs</FieldLabel>
                    <FieldInput
                      type="number"
                      min="1"
                      max={MAX_BATCH_SIZE}
                      placeholder="Enter number of NFTs"
                      disabled={transactionInProcess}
                      $hasError={!!batchErrors.batchSize}
                      // eslint-disable-next-line react/jsx-props-no-spreading
                      {...registerBatch('batchSize', {
                        required: 'Number of NFTs is required',
                        min: { value: 1, message: 'Must mint at least 1 NFT' },
                        max: {
                          value: MAX_BATCH_SIZE,
                          message: `Maximum ${MAX_BATCH_SIZE} NFTs per batch`,
                        },
                        valueAsNumber: true,
                      })}
                    />
                  </FieldRow>
                  {batchErrors.batchSize && (
                    <StyledErrorMessage>
                      {batchErrors.batchSize.message}
                    </StyledErrorMessage>
                  )}
                </FieldWrapper>
              )}
            </div>
          )}

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
              onClick={
                mintMode === MintMode.SINGLE
                  ? handleSubmitSingle(onSubmitSingle)
                  : handleSubmitBatch(onSubmitBatch)
              }
              disabled={
                transactionInProcess ||
                (mintMode === MintMode.SINGLE
                  ? Object.keys(singleErrors).length > 0
                  : Object.keys(batchErrors).length > 0 ||
                    (hasCollectionKeys && csvData.length === 0))
              }
            >
              {primaryButtonLabel}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
