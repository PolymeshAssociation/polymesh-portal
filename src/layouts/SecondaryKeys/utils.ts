import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import type {
  Asset,
  DefaultPortfolio,
  Identity,
  ModuleName,
  NumberedPortfolio,
  PermissionedAccount,
  PermissionsLike,
  PortfolioLike,
  TxTag,
} from '@polymeshassociation/polymesh-sdk/types';
import { PermissionType } from '@polymeshassociation/polymesh-sdk/types';
import { formatUuid } from '~/helpers/formatters';
import { IPermissionFormData } from './types';

export interface AssetDetails {
  id: string;
  name?: string;
  ticker?: string;
}

/**
 * Deduplicates assets by ID, keeping the first occurrence.
 * Useful when assets come from multiple sources (owned and managed).
 */
export const deduplicateAssetsByID = (
  ...assetGroups: Array<AssetDetails[] | undefined>
): AssetDetails[] => {
  const combined = assetGroups.flatMap((group) => group || []);
  // Remove duplicates by ID, keeping first occurrence
  const seenIds = new Set<string>();
  const deduplicated: AssetDetails[] = [];
  combined.forEach((asset) => {
    if (!seenIds.has(asset.id)) {
      seenIds.add(asset.id);
      deduplicated.push(asset);
    }
  });
  return deduplicated;
};

/**
 * Formats an asset for display with priority: Name > Ticker > ID (Abbreviated)
 */
export const formatAssetDisplay = (
  assetId: string,
  assets: AssetDetails[] = [],
): string => {
  const asset = assets.find((a) => a.id === assetId);
  const formattedId = formatUuid(assetId);

  if (!asset) {
    // Fallback to abbreviated ID
    return formattedId;
  }

  // Build display string: "ID - name (ticker)"
  let display = formattedId;

  if (asset.name) {
    display += ` - ${asset.name}`;
  }

  if (asset.ticker) {
    display += ` (${asset.ticker})`;
  }

  return display;
};

/**
 * Converts UI permission format to SDK permission format.
 * This is the critical bridge between the UI's serializable form data and the SDK's entity-based API.
 *
 * Key transformations:
 * 1. Permission types: UI's 'Whole'/'These'/'Except' → SDK's null/Include/Exclude
 * 2. Asset values: Asset IDs (strings) stay as-is (SDK accepts string IDs)
 * 3. Transactions: Flatten nested pallet structure back to flat tag strings
 *    Example: [{pallet: 'asset', extrinsics: ['issue']}] → ['asset.issue']
 * 4. Portfolios: Convert to PortfolioLike without fetching portfolio entities
 *
 * @param permissions - UI form data with serializable values
 * @param identity - Current user's identity (for portfolio resolution)
 * @returns SDK-formatted permissions ready for modifyPermissions() transaction
 */
export const convertUiPermissionsToSdk = async (
  permissions: IPermissionFormData,
  identity: Identity,
): Promise<PermissionsLike> => {
  const sdkPermissions: PermissionsLike = {
    assets: null,
    transactions: null,
    portfolios: null,
  };

  // ASSETS CONVERSION:
  // UI 'Whole' → SDK null (unrestricted)
  // UI 'None' → SDK Include with empty values (no access)
  // UI 'These' → SDK Include with specified values
  // UI 'Except' → SDK Exclude with specified values
  if (permissions.assets.type === 'Whole') {
    sdkPermissions.assets = null;
  } else if (permissions.assets.type === 'None') {
    sdkPermissions.assets = {
      type: PermissionType.Include,
      values: [],
    };
  } else {
    sdkPermissions.assets = {
      type:
        permissions.assets.type === 'These'
          ? PermissionType.Include
          : PermissionType.Exclude,
      values: permissions.assets.values,
    };
  }

  // TRANSACTIONS CONVERSION:
  // Flatten nested pallet structure back to flat transaction tags.
  // Input: [{pallet: 'asset', extrinsics: ['issue', 'registerTicker']}, {pallet: 'staking', extrinsics: undefined}]
  // Output: ['asset.issue', 'asset.registerTicker', 'staking']
  // NOTE: Transactions don't support 'Except' in SDK, only 'Whole' (null) or 'These' (Include with tags)
  if (permissions.transactions.type === 'Whole') {
    sdkPermissions.transactions = null;
  } else if (permissions.transactions.type === 'None') {
    sdkPermissions.transactions = {
      type: PermissionType.Include,
      values: [],
    };
  } else {
    const txTags: Array<TxTag | ModuleName> = [];
    permissions.transactions.values.forEach(({ pallet, extrinsics }) => {
      if (extrinsics === undefined || extrinsics === null) {
        // undefined/null means all transactions in this pallet
        txTags.push(pallet as ModuleName);
      } else if (extrinsics.length > 0) {
        // Add specific extrinsics with dot notation
        extrinsics.forEach((extrinsic) => {
          txTags.push(`${pallet}.${extrinsic}` as TxTag);
        });
      }
    });

    sdkPermissions.transactions = {
      type: PermissionType.Include,
      values: txTags,
    };
  }

  // PORTFOLIOS CONVERSION:
  // Convert to PortfolioLike without fetching portfolio entities.
  // Input: [{id: '1', ownerDid: 'did:poly:xxx'}, {id: 'default', ownerDid: 'did:poly:xxx'}]
  // Output: [{ id: BigNumber(1), identity: 'did:poly:xxx' }, 'did:poly:xxx']
  if (permissions.portfolios.type === 'Whole') {
    sdkPermissions.portfolios = null;
  } else if (permissions.portfolios.type === 'None') {
    sdkPermissions.portfolios = {
      type: PermissionType.Include,
      values: [],
    };
  } else {
    const portfolioValues: PortfolioLike[] = permissions.portfolios.values.map(
      ({ id: portfolioId, ownerDid }) => {
        const portfolioIdentity = ownerDid || identity;

        if (portfolioId === '0' || portfolioId === 'default') {
          return portfolioIdentity;
        }

        return {
          id: new BigNumber(portfolioId),
          identity: portfolioIdentity,
        };
      },
    );

    sdkPermissions.portfolios = {
      type:
        permissions.portfolios.type === 'These'
          ? PermissionType.Include
          : PermissionType.Exclude,
      values: portfolioValues,
    };
  }

  return sdkPermissions;
};

/**
 * Converts SDK's PermissionedAccount to UI's IPermissionFormData.
 * This reverse transformation prepares blockchain data for form editing.
 *
 * Key transformations:
 * 1. Permission types: SDK's null/Include/Exclude → UI's 'Whole'/'None'/'These'/'Except'
 * 2. Asset values: Extract asset IDs from SDK entity objects
 * 3. Transactions: Group flat transaction tags by pallet
 *    Example: ['asset.issue', 'asset.registerTicker', 'staking'] → [{pallet: 'asset', extrinsics: ['issue', 'registerTicker']}, {pallet: 'staking', extrinsics: undefined}]
 * 4. Portfolios: Extract ID and owner DID from Portfolio entities
 *
 * @param key - Secondary key data from blockchain with SDK entity objects
 * @returns UI form data ready for editing in the permissions modal
 */
export const convertKeyDataToFormData = (
  key: PermissionedAccount,
): IPermissionFormData => {
  // Validate input
  if (!key || !key.account || !key.permissions) {
    throw new Error(
      'Invalid secondary key data: missing address or permissions',
    );
  }

  /**
   * Normalize SDK permission types to UI permission types.
   * Converts SDK's 2 permission types (Include/Exclude) + null to UI's 4 types.
   * - null (unrestricted) → 'Whole'
   * - Include with empty values → 'None' (no access)
   * - Include with values → 'These' (specific items)
   * - Exclude with empty values → 'Whole' (exclude nothing = allow everything)
   * - Exclude with values → 'Except' (all except these items)
   */
  const normalizeType = (
    permission:
      | {
          type: PermissionType;
          values: Array<Asset | DefaultPortfolio | NumberedPortfolio>;
        }
      | null
      | undefined,
  ): 'Whole' | 'None' | 'These' | 'Except' => {
    if (!permission) return 'Whole';

    if (permission.type === PermissionType.Include) {
      return permission.values.length === 0 ? 'None' : 'These';
    }

    if (permission.type === PermissionType.Exclude) {
      return permission.values.length === 0 ? 'Whole' : 'Except';
    }

    return 'Whole';
  };

  /**
   * Normalize SDK transaction permission types to UI permission types.
   * Note: Blockchain only supports Include or null for transactions, never Exclude.
   * - null (unrestricted) → 'Whole'
   * - Include with empty values → 'None' (no access)
   * - Include with values → 'These' (specific transactions)
   */
  const normalizeTransactionType = (
    permission:
      | { type: PermissionType; values: Array<TxTag | ModuleName> }
      | null
      | undefined,
  ): 'Whole' | 'None' | 'These' => {
    if (!permission) return 'Whole';

    if (permission.type === PermissionType.Include) {
      return permission.values.length === 0 ? 'None' : 'These';
    }

    return 'Whole';
  };

  const assetsPermission = key.permissions.assets;
  const transactionsPermission = key.permissions.transactions;
  const portfoliosPermission = key.permissions.portfolios;

  // TRANSACTIONS CONSOLIDATION:
  // Group flat transaction tags by pallet into nested structure for UI.
  // 'asset.issue' -> {pallet: 'asset', extrinsics: ['issue']}
  // 'staking' -> {pallet: 'staking', extrinsics: undefined}
  const transactionValues = transactionsPermission?.values ?? [];
  const palletMap = new Map<string, string[]>();

  transactionValues.forEach((value) => {
    if (value.includes('.')) {
      // Tag with dot: split into pallet and extrinsic
      const [pallet, extrinsic] = value.split('.');
      if (!palletMap.has(pallet)) {
        palletMap.set(pallet, []);
      }
      palletMap.get(pallet)!.push(extrinsic);
    } else {
      // Tag without dot: represents all extrinsics in pallet
      palletMap.set(value, []);
    }
  });

  const consolidatedTransactions = Array.from(palletMap.entries()).map(
    ([pallet, extrinsics]) => ({
      pallet,
      // undefined = all extrinsics in this pallet; empty array = specific extrinsics
      extrinsics: extrinsics.length > 0 ? extrinsics : undefined,
    }),
  );

  return {
    assets: {
      type: normalizeType(assetsPermission),
      values: assetsPermission?.values.map((asset) => asset.id) ?? [],
    },
    transactions: {
      type: normalizeTransactionType(transactionsPermission),
      values: consolidatedTransactions,
    },
    portfolios: {
      type: normalizeType(portfoliosPermission),
      values:
        portfoliosPermission?.values.map((portfolio) => {
          const portfolioId =
            'id' in portfolio ? portfolio.id.toString() : 'default';
          const ownerDid = portfolio.owner.did;
          return { id: portfolioId, ownerDid };
        }) ?? [],
    },
  };
};
