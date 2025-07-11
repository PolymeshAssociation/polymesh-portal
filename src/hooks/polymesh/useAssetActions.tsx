import { useContext } from 'react';
import {
  Asset,
  FungibleAsset,
  NftCollection,
  IssueTokensParams,
  RedeemTokensParams,
  AssetMediatorParams,
  ControllerTransferParams,
  NftControllerTransferParams,
  LinkTickerToAssetParams,
  SetVenueFilteringParams,
  TransferAssetOwnershipParams,
  ModifyAssetParams,
  SecurityIdentifier,
  KnownAssetType,
  NumberedPortfolio,
  DefaultPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { notifyError } from '~/helpers/notifications';
import { PortfolioContext } from '~/context/PortfolioContext';

const useAssetActions = (
  asset: Asset | undefined,
  onTransactionSuccess?: () => void | Promise<void>,
) => {
  const { getPortfoliosData } = useContext(PortfolioContext);
  const {
    executeTransaction,
    executeBatchTransaction,
    isTransactionInProgress,
  } = useTransactionStatusContext();

  // Check if any transactions are in process
  const transactionInProcess = isTransactionInProgress;

  // Helper to create transaction options
  const createOptions = (
    onTransactionRunning?: () => void | Promise<void>,
    onSuccess?: () => void | Promise<void>,
  ) => ({
    onTransactionRunning,
    onSuccess: async () => {
      // Call custom success callback first
      if (onSuccess) {
        await onSuccess();
      }
      // Then call the original transaction success callback
      if (onTransactionSuccess) {
        await onTransactionSuccess();
      }
    },
    onError: (error: Error) => {
      notifyError(error.message);
    },
  });

  const issueTokens = async ({
    amount,
    portfolioId,
    onTransactionRunning,
  }: IssueTokensParams & {
    onTransactionRunning?: () => void | Promise<void>;
  }) => {
    // Check if the asset is a fungible asset (not NFT collection)
    if (!asset || !('issuance' in asset)) {
      notifyError('Asset does not support token issuance');
      return;
    }

    try {
      await executeTransaction(
        asset.issuance.issue({
          amount,
          portfolioId,
        }),
        createOptions(onTransactionRunning, getPortfoliosData),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const redeemTokens = async ({
    amount,
    from,
    onTransactionRunning,
  }: RedeemTokensParams & {
    onTransactionRunning?: () => void | Promise<void>;
  }) => {
    // Check if the asset is a fungible asset (not NFT collection)
    if (!asset || !('redeem' in asset)) {
      notifyError('Asset does not support token redemption');
      return;
    }

    try {
      await executeTransaction(
        asset.redeem({
          amount,
          from,
        }),
        createOptions(onTransactionRunning, getPortfoliosData),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const redeemNfts = async ({
    nftIds,
    from,
    onTransactionRunning,
  }: {
    nftIds: BigNumber[];
    from: NumberedPortfolio | DefaultPortfolio;
    onTransactionRunning?: () => void | Promise<void>;
  }) => {
    if (!asset || !('getNft' in asset)) {
      notifyError('Asset does not support NFT redemption');
      return;
    }

    try {
      // For multiple NFTs, we need to get each NFT instance and call redeem on it
      const nftCollection = asset as NftCollection;

      if (nftIds.length === 1) {
        // Single NFT redemption
        const nft = await nftCollection.getNft({ id: nftIds[0] });
        await executeTransaction(
          nft.redeem({ from }),
          createOptions(onTransactionRunning, getPortfoliosData),
        );
      } else {
        // Batch redemption for multiple NFTs
        const nfts = await Promise.all(
          nftIds.map((id) => nftCollection.getNft({ id })),
        );

        const redeemTransactions = nfts.map((nft) => nft.redeem({ from }));

        await executeBatchTransaction(
          redeemTransactions,
          createOptions(onTransactionRunning, getPortfoliosData),
        );
      }
    } catch (error) {
      notifyError('Failed to redeem NFTs');
      throw error;
    }
  };

  const addRequiredMediators = async ({
    mediators,
    onTransactionRunning,
  }: AssetMediatorParams & {
    onTransactionRunning?: () => void | Promise<void>;
  }) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    try {
      await executeTransaction(
        asset.addRequiredMediators({ mediators }),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const removeRequiredMediators = async ({
    mediators,
    onTransactionRunning,
  }: AssetMediatorParams & {
    onTransactionRunning?: () => void | Promise<void>;
  }) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    try {
      await executeTransaction(
        asset.removeRequiredMediators({ mediators }),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const controllerTransfer = async (
    params: (ControllerTransferParams | NftControllerTransferParams) & {
      onTransactionRunning?: () => void | Promise<void>;
    },
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    const { onTransactionRunning, ...transferParams } = params;

    try {
      // Type narrowing: check if asset is FungibleAsset or NftCollection
      if ('issuance' in asset) {
        // FungibleAsset - expects ControllerTransferParams
        const fungibleParams = transferParams as ControllerTransferParams;
        await executeTransaction(
          (asset as FungibleAsset).controllerTransfer(fungibleParams),
          createOptions(onTransactionRunning, getPortfoliosData),
        );
      } else if ('issue' in asset) {
        // NftCollection - expects NftControllerTransferParams
        const nftParams = transferParams as NftControllerTransferParams;

        // Check if we need to batch NFT transfers
        const MaxNumberOfNFTsPerLeg = 10;
        if (nftParams.nfts && nftParams.nfts.length > MaxNumberOfNFTsPerLeg) {
          // Split NFTs into batches and create a batch transaction
          const batchCallPromises = [];

          // Split NFTs into chunks of MaxNumberOfNFTsPerLeg
          for (
            let i = 0;
            i < nftParams.nfts.length;
            i += MaxNumberOfNFTsPerLeg
          ) {
            const nftBatch = nftParams.nfts.slice(i, i + MaxNumberOfNFTsPerLeg);
            const batchParams = { ...nftParams, nfts: nftBatch };

            const controllerTransferTx = (
              asset as NftCollection
            ).controllerTransfer(batchParams);
            batchCallPromises.push(controllerTransferTx);
          }

          await executeBatchTransaction(
            batchCallPromises,
            createOptions(onTransactionRunning, getPortfoliosData),
          );
        } else {
          // Single transaction for 10 or fewer NFTs
          await executeTransaction(
            (asset as NftCollection).controllerTransfer(nftParams),
            createOptions(onTransactionRunning, getPortfoliosData),
          );
        }
      } else {
        notifyError(
          'Asset could not be identified as a Fungible or Non-Fungible type',
        );
      }
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const freeze = async (onTransactionRunning?: () => void | Promise<void>) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    try {
      await executeTransaction(
        asset.freeze(),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const unfreeze = async (
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    try {
      await executeTransaction(
        asset.unfreeze(),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const linkTicker = async ({
    ticker,
    onTransactionRunning,
  }: LinkTickerToAssetParams & {
    onTransactionRunning?: () => void | Promise<void>;
  }) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    try {
      await executeTransaction(
        asset.linkTicker({ ticker }),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const setVenueFiltering = async ({
    enabled,
    allowedVenues,
    disallowedVenues,
    onTransactionRunning,
  }: SetVenueFilteringParams & {
    onTransactionRunning?: () => void | Promise<void>;
  }) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }
    try {
      await executeTransaction(
        asset.setVenueFiltering({
          enabled,
          allowedVenues,
          disallowedVenues,
        }),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const transferOwnership = async ({
    target,
    onTransactionRunning,
  }: TransferAssetOwnershipParams & {
    onTransactionRunning?: () => void | Promise<void>;
  }) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    try {
      await executeTransaction(
        asset.transferOwnership({ target }),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const unlinkTicker = async (
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    try {
      await executeTransaction(
        asset.unlinkTicker(),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const modifyAssetName = async (
    assetName: string,
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    try {
      await executeTransaction(
        asset.modify({ name: assetName }),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const modifyAssetType = async (
    assetType: KnownAssetType | string | BigNumber,
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    try {
      await executeTransaction(
        asset.modify({ assetType }),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const modifyFundingRound = async (
    fundingRound: string,
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }
    try {
      await executeTransaction(
        asset.modify({ fundingRound }),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const modifyAssetIdentifiers = async (
    identifiers: SecurityIdentifier[],
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }
    try {
      await executeTransaction(
        asset.modify({ identifiers }),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const makeAssetDivisible = async (
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    try {
      await executeTransaction(
        asset.modify({ makeDivisible: true }),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const modifyAssetProperties = async (
    params: ModifyAssetParams,
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }
    try {
      await executeTransaction(
        asset.modify(params),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const pauseCompliance = async (
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }
    try {
      await executeTransaction(
        asset.compliance.requirements.pause(),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const unpauseCompliance = async (
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }
    try {
      await executeTransaction(
        asset.compliance.requirements.unpause(),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const removeTrustedClaimIssuers = async (
    claimIssuers: string[],
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }
    try {
      await executeTransaction(
        asset.compliance.trustedClaimIssuers.remove({ claimIssuers }),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const removeAssetAgent = async (
    agentId: string,
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    try {
      await executeTransaction(
        asset.permissions.removeAgent({ target: agentId }),
        createOptions(onTransactionRunning),
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  return {
    issueTokens,
    redeemTokens,
    redeemNfts,
    addRequiredMediators,
    removeRequiredMediators,
    controllerTransfer,
    freeze,
    unfreeze,
    linkTicker,
    setVenueFiltering,
    transferOwnership,
    unlinkTicker,
    modifyAssetName,
    modifyAssetType,
    modifyFundingRound,
    modifyAssetIdentifiers,
    makeAssetDivisible,
    modifyAssetProperties,
    pauseCompliance,
    unpauseCompliance,
    removeTrustedClaimIssuers,
    removeAssetAgent,
    transactionInProcess,
  };
};

export default useAssetActions;
