import { useContext, useState } from 'react';
import {
  Asset,
  FungibleAsset,
  NftCollection,
  UnsubCallback,
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
  TransactionStatus,
  GenericPolymeshTransaction,
  NumberedPortfolio,
  DefaultPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatus } from '~/hooks/polymesh';
import { notifyError } from '~/helpers/notifications';
import { PortfolioContext } from '~/context/PortfolioContext';

const useAssetActions = (
  asset: Asset | undefined,
  onTransactionSuccess?: () => void | Promise<void>,
) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { getPortfoliosData } = useContext(PortfolioContext);
  const [transactionInProcess, setTransactionInProcess] = useState(false);
  const { handleStatusChange } = useTransactionStatus();

  // Generic transaction execution helper
  const executeTransaction = async (
    transactionPromise: Promise<GenericPolymeshTransaction<unknown, unknown>>,
    onTransactionRunning?: () => void | Promise<void>,
    onSuccess?: () => void | Promise<void>,
  ): Promise<void> => {
    if (!sdk || !asset) {
      notifyError('SDK or asset not available');
      return;
    }

    setTransactionInProcess(true);
    let unsubCb: UnsubCallback | null = null;

    try {
      const tx = await transactionPromise;

      unsubCb = tx.onStatusChange((txState) => {
        handleStatusChange(txState);
        if (
          txState.status === TransactionStatus.Running &&
          onTransactionRunning
        ) {
          onTransactionRunning();
        }
        if (txState.status === TransactionStatus.Succeeded) {
          // Call the custom success callback first
          if (onSuccess) {
            onSuccess();
          }
          // Then call the original transaction success callback
          if (onTransactionSuccess) {
            onTransactionSuccess();
          }
        }
      });

      await tx.run();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setTransactionInProcess(false);
      if (unsubCb) {
        unsubCb();
      }
    }
  };

  // Generic batch transaction execution helper
  const executeBatchTransaction = async (
    transactionPromises: Promise<
      GenericPolymeshTransaction<unknown, unknown>
    >[],
    onTransactionRunning?: () => void | Promise<void>,
    onSuccess?: () => void | Promise<void>,
  ): Promise<void> => {
    if (!sdk) {
      notifyError('SDK not available');
      return;
    }

    setTransactionInProcess(true);
    let unsubCb: UnsubCallback | null = null;

    try {
      // Resolve all transaction promises
      const transactions = await Promise.all(transactionPromises);

      // Create batch transaction
      const batchTransaction = await sdk.createTransactionBatch({
        transactions,
      });

      unsubCb = batchTransaction.onStatusChange((tx) => {
        handleStatusChange(tx);
        if (tx.status === TransactionStatus.Running && onTransactionRunning) {
          onTransactionRunning();
        }
        if (tx.status === TransactionStatus.Succeeded) {
          // Call the custom success callback first
          if (onSuccess) {
            onSuccess();
          }
          // Then call the original transaction success callback
          if (onTransactionSuccess) {
            onTransactionSuccess();
          }
        }
      });

      await batchTransaction.run();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setTransactionInProcess(false);
      if (unsubCb) {
        unsubCb();
      }
    }
  };

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

    await executeTransaction(
      asset.issuance.issue({
        amount,
        portfolioId,
      }) as Promise<GenericPolymeshTransaction<unknown, unknown>>,
      onTransactionRunning,
      getPortfoliosData,
    );
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

    await executeTransaction(
      asset.redeem({
        amount,
        from,
      }) as Promise<GenericPolymeshTransaction<unknown, unknown>>,
      onTransactionRunning,
      getPortfoliosData,
    );
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
          nft.redeem({ from }) as Promise<
            GenericPolymeshTransaction<unknown, unknown>
          >,
          onTransactionRunning,
          getPortfoliosData,
        );
      } else {
        // Batch redemption for multiple NFTs (up to 10)
        const nfts = await Promise.all(
          nftIds.map((id) => nftCollection.getNft({ id })),
        );

        const redeemTransactions = nfts.map(
          (nft) =>
            nft.redeem({ from }) as Promise<
              GenericPolymeshTransaction<unknown, unknown>
            >,
        );

        await executeBatchTransaction(
          redeemTransactions,
          onTransactionRunning,
          getPortfoliosData,
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

    await executeTransaction(
      asset.addRequiredMediators({
        mediators,
      }) as Promise<GenericPolymeshTransaction<unknown, unknown>>,
      onTransactionRunning,
    );
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

    await executeTransaction(
      asset.removeRequiredMediators({
        mediators,
      }) as Promise<GenericPolymeshTransaction<unknown, unknown>>,
      onTransactionRunning,
    );
  };

  const controllerTransfer = async (
    params: (ControllerTransferParams | NftControllerTransferParams) & {
      onTransactionRunning?: () => void | Promise<void>;
    },
  ) => {
    if (!asset || !sdk) {
      notifyError('Asset or SDK not available');
      return;
    }

    const { onTransactionRunning, ...transferParams } = params;

    // Type narrowing: check if asset is FungibleAsset or NftCollection
    // FungibleAsset has 'issuance' property, NftCollection has 'issue' method
    if ('issuance' in asset) {
      // FungibleAsset - expects ControllerTransferParams
      const fungibleParams = transferParams as ControllerTransferParams;
      await executeTransaction(
        (asset as FungibleAsset).controllerTransfer(fungibleParams) as Promise<
          GenericPolymeshTransaction<unknown, unknown>
        >,
        onTransactionRunning,
        getPortfoliosData,
      );
    } else if ('issue' in asset) {
      // NftCollection - expects NftControllerTransferParams
      const nftParams = transferParams as NftControllerTransferParams;

      // Check if we need to batch NFT transfers
      const MaxNumberOfNFTsPerLeg = 10;

      if (nftParams.nfts && nftParams.nfts.length > MaxNumberOfNFTsPerLeg) {
        // Split NFTs into batches and create a batch transaction
        const batchCallPromises: Promise<
          GenericPolymeshTransaction<void, void>
        >[] = [];

        // Split NFTs into chunks of MaxNumberOfNFTsPerLeg
        for (let i = 0; i < nftParams.nfts.length; i += MaxNumberOfNFTsPerLeg) {
          const nftBatch = nftParams.nfts.slice(i, i + MaxNumberOfNFTsPerLeg);
          const batchParams = { ...nftParams, nfts: nftBatch };

          const transferTx = (asset as NftCollection).controllerTransfer(
            batchParams,
          );
          batchCallPromises.push(transferTx);
        }

        // Execute batch transaction using the reusable helper
        await executeBatchTransaction(
          batchCallPromises as Promise<
            GenericPolymeshTransaction<unknown, unknown>
          >[],
          onTransactionRunning,
          getPortfoliosData,
        );
      } else {
        // Single transaction for 10 or fewer NFTs
        await executeTransaction(
          (asset as NftCollection).controllerTransfer(nftParams) as Promise<
            GenericPolymeshTransaction<unknown, unknown>
          >,
          onTransactionRunning,
          getPortfoliosData,
        );
      }
    } else {
      notifyError(
        'Asset could not be identified as a Fungible or Non-Fungible type',
      );
    }
  };

  const freeze = async (onTransactionRunning?: () => void | Promise<void>) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    await executeTransaction(
      asset.freeze() as Promise<GenericPolymeshTransaction<unknown, unknown>>,
      onTransactionRunning,
    );
  };

  const unfreeze = async (
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    await executeTransaction(
      asset.unfreeze() as Promise<GenericPolymeshTransaction<unknown, unknown>>,
      onTransactionRunning,
    );
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

    await executeTransaction(
      asset.linkTicker({
        ticker,
      }) as Promise<GenericPolymeshTransaction<unknown, unknown>>,
      onTransactionRunning,
    );
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

    await executeTransaction(
      asset.setVenueFiltering({
        enabled,
        allowedVenues,
        disallowedVenues,
      }) as Promise<GenericPolymeshTransaction<unknown, unknown>>,
      onTransactionRunning,
    );
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

    await executeTransaction(
      asset.transferOwnership({
        target,
      }) as Promise<GenericPolymeshTransaction<unknown, unknown>>,
      onTransactionRunning,
    );
  };

  const unlinkTicker = async (
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    await executeTransaction(
      asset.unlinkTicker() as Promise<
        GenericPolymeshTransaction<unknown, unknown>
      >,
      onTransactionRunning,
    );
  };

  // Asset modification wrapper functions

  /**
   * Modify the asset's name
   */
  const modifyAssetName = async (
    name: string,
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    await executeTransaction(
      asset.modify({ name }) as Promise<
        GenericPolymeshTransaction<unknown, unknown>
      >,
      onTransactionRunning,
    );
  };

  /**
   * Modify the asset's type
   */
  const modifyAssetType = async (
    assetType: KnownAssetType | string | BigNumber,
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    await executeTransaction(
      asset.modify({ assetType }) as Promise<
        GenericPolymeshTransaction<unknown, unknown>
      >,
      onTransactionRunning,
    );
  };

  /**
   * Modify the asset's funding round
   */
  const modifyFundingRound = async (
    fundingRound: string,
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    await executeTransaction(
      asset.modify({ fundingRound }) as Promise<
        GenericPolymeshTransaction<unknown, unknown>
      >,
      onTransactionRunning,
    );
  };

  /**
   * Modify the asset's identifiers
   */
  const modifyAssetIdentifiers = async (
    identifiers: SecurityIdentifier[],
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    await executeTransaction(
      asset.modify({ identifiers }) as Promise<
        GenericPolymeshTransaction<unknown, unknown>
      >,
      onTransactionRunning,
    );
  };

  /**
   * Make the asset divisible (only for fungible assets)
   */
  const makeAssetDivisible = async (
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    await executeTransaction(
      asset.modify({ makeDivisible: true }) as Promise<
        GenericPolymeshTransaction<unknown, unknown>
      >,
      onTransactionRunning,
    );
  };

  /**
   * Modify multiple asset properties at once
   */
  const modifyAssetProperties = async (
    params: ModifyAssetParams,
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    await executeTransaction(
      asset.modify(params) as Promise<
        GenericPolymeshTransaction<unknown, unknown>
      >,
      onTransactionRunning,
    );
  };

  /**
   * Create a custom asset type
   */
  const createCustomAssetType = async (
    name: string,
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!sdk) {
      notifyError('SDK not available');
      return undefined;
    }

    return executeTransaction(
      sdk.assets.registerCustomAssetType({ name }) as Promise<
        GenericPolymeshTransaction<unknown, unknown>
      >,
      onTransactionRunning,
    );
  };

  /**
   * Pause compliance requirements
   */
  const pauseCompliance = async (
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    await executeTransaction(
      asset.compliance.requirements.pause() as Promise<
        GenericPolymeshTransaction<unknown, unknown>
      >,
      onTransactionRunning,
    );
  };

  /**
   * Unpause (resume) compliance requirements
   */
  const unpauseCompliance = async (
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    await executeTransaction(
      asset.compliance.requirements.unpause() as Promise<
        GenericPolymeshTransaction<unknown, unknown>
      >,
      onTransactionRunning,
    );
  };

  /**
   * Remove trusted claim issuers
   */
  const removeTrustedClaimIssuers = async (
    claimIssuers: Array<string>,
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    await executeTransaction(
      asset.compliance.trustedClaimIssuers.remove({ claimIssuers }) as Promise<
        GenericPolymeshTransaction<unknown, unknown>
      >,
      onTransactionRunning,
    );
  };

  /**
   * Remove asset agent
   */
  const removeAssetAgent = async (
    agentId: string,
    onTransactionRunning?: () => void | Promise<void>,
  ) => {
    if (!asset) {
      notifyError('Asset not available');
      return;
    }

    await executeTransaction(
      asset.permissions.removeAgent({ target: agentId }) as Promise<
        GenericPolymeshTransaction<unknown, unknown>
      >,
      onTransactionRunning,
    );
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
    createCustomAssetType,
    transactionInProcess,
    pauseCompliance,
    unpauseCompliance,
    removeTrustedClaimIssuers,
    removeAssetAgent,
  };
};

export default useAssetActions;
