import type {
  DefaultPortfolio,
  NumberedPortfolio,
  PermissionedAccount,
} from '@polymeshassociation/polymesh-sdk/types';
import { PermissionType } from '@polymeshassociation/polymesh-sdk/types';
import { useCallback, useContext, useMemo, useState } from 'react';
import { CopyToClipboard, Icon } from '~/components';
import { Button } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { AssetContext } from '~/context/AssetContext';
import {
  capitalizeFirstLetter,
  formatBalance,
  formatDid,
} from '~/helpers/formatters';
import { usePortfolioLookup } from '~/hooks/polymesh/usePortfolioLookup';
import { PermissionScopeType } from '../../types';
import { deduplicateAssetsByID, formatAssetDisplay } from '../../utils';
import {
  KeyAddress,
  KeyAddressWrapper,
  KeyBalance,
  KeyInfo,
  KeyName,
  PermissionDetailItem,
  PermissionDetailLabel,
  PermissionDetailList,
  PermissionDetails,
  PermissionDetailValue,
  PermissionLabel,
  PortfolioDetailValueWrapper,
  PortfolioInfo,
  PortfolioOwnerDid,
  StyledButtonsWrapper,
  StyledDetailItem,
  StyledDetailsWrapper,
  StyledDetailValue,
  StyledInfoWrapper,
  StyledSecondaryKeyItem,
} from './styles';

interface ISecondaryKeyItemProps {
  data: PermissionedAccount;
  onEdit: () => void;
  onRemovePermissions: () => void;
  onRemoveKey: () => void;
  isTransactionInProgress?: boolean;
}

type NormalizedPermission<T> = {
  type: PermissionScopeType;
  values: T[];
};

type PermissionDisplayInfo = {
  type: PermissionScopeType;
  valueCount: number;
};

// Helper function to format permission display
const formatPermissionDisplay = (
  permission: PermissionDisplayInfo,
  label: string,
): { text: string; title: string } => {
  const count = permission.valueCount;
  const pluralLabel = label === 'Function' ? 'Functions' : `${label}s`;

  switch (permission.type) {
    case 'Whole':
      return {
        text: `All ${pluralLabel}`,
        title: `All ${pluralLabel}`,
      };
    case 'These':
      if (count === 0) {
        return {
          text: `No ${pluralLabel}`,
          title: `No ${pluralLabel}`,
        };
      }
      return {
        text: `${count} ${label}${count === 1 ? '' : 's'}`,
        title: `${count} specific ${label.toLowerCase()}${count === 1 ? '' : 's'}`,
      };
    case 'Except':
      if (count === 0) {
        return {
          text: `All ${pluralLabel}`,
          title: `All ${pluralLabel}`,
        };
      }
      return {
        text: `All Except ${count}`,
        title: `All except ${count} ${label.toLowerCase()}${count === 1 ? '' : 's'}`,
      };
    default:
      return { text: '', title: '' };
  }
};

export const SecondaryKeyItem = ({
  data,
  onEdit,
  onRemovePermissions,
  onRemoveKey,
  isTransactionInProgress = false,
}: ISecondaryKeyItemProps) => {
  const { allAccountsWithMeta, allKeyInfo, identity } =
    useContext(AccountContext);
  const { ownedAssets, managedAssets } = useContext(AssetContext);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const { account, permissions } = data;
  const { address } = account;

  // Combine all available assets and deduplicate
  const allAssets = useMemo(
    () => deduplicateAssetsByID(ownedAssets, managedAssets),
    [ownedAssets, managedAssets],
  );

  // Memoize key metadata lookups
  const keyMeta = useMemo(
    () =>
      allAccountsWithMeta.find(
        ({ address: accountAddress }) => accountAddress === address,
      )?.meta,
    [allAccountsWithMeta, address],
  );

  const keyBalance = useMemo(
    () => allKeyInfo.find(({ key }) => key === address)?.totalBalance || '0',
    [allKeyInfo, address],
  );

  const normalizePermission = <T, U>(
    permission: { type: PermissionType; values: T[] } | null | undefined,
    mapValue: (value: T) => U,
  ): NormalizedPermission<U> => {
    if (!permission) {
      return { type: 'Whole', values: [] };
    }

    if (
      permission.type === PermissionType.Include &&
      permission.values.length === 0
    ) {
      return { type: 'These', values: [] };
    }

    if (
      permission.type === PermissionType.Exclude &&
      permission.values.length === 0
    ) {
      return { type: 'Whole', values: [] };
    }

    return {
      type: permission.type === PermissionType.Include ? 'These' : 'Except',
      values: permission.values.map(mapValue),
    };
  };

  const parseTransactionTag = (value: string) => {
    const [pallet, extrinsic] = value.split('.');
    return {
      pallet,
      extrinsics: extrinsic ? [extrinsic] : undefined,
    };
  };

  const assetsPermission = useMemo(
    () =>
      normalizePermission(
        permissions.assets,
        (asset: { id: string }) => asset.id,
      ),
    [permissions.assets],
  );

  const transactionsPermission = useMemo(
    () =>
      normalizePermission(permissions.transactions, (value: string) =>
        parseTransactionTag(value),
      ),
    [permissions.transactions],
  );

  const portfoliosPermission = useMemo(
    () =>
      normalizePermission(
        permissions.portfolios,
        (portfolio: DefaultPortfolio | NumberedPortfolio) => portfolio,
      ),
    [permissions.portfolios],
  );

  // Use the shared portfolio lookup hook for getting names
  const { getPortfolioInfo } = usePortfolioLookup(
    portfoliosPermission.values.map((portfolio) => {
      const portfolioId =
        'id' in portfolio ? portfolio.id.toString() : 'default';
      return {
        id: portfolioId,
        ownerDid: portfolio.owner.did,
        portfolio,
      };
    }),
  );

  // Format permission displays
  const assetsDisplay = useMemo(() => {
    const displayInfo: PermissionDisplayInfo = {
      type: assetsPermission.type,
      valueCount: assetsPermission.values.length,
    };
    return formatPermissionDisplay(displayInfo, 'Asset');
  }, [assetsPermission]);

  const extrinsicsDisplay = useMemo(() => {
    const displayInfo: PermissionDisplayInfo = {
      type: transactionsPermission.type,
      valueCount: transactionsPermission.values.length,
    };
    return formatPermissionDisplay(displayInfo, 'Function');
  }, [transactionsPermission]);

  const portfoliosDisplay = useMemo(() => {
    const displayInfo: PermissionDisplayInfo = {
      type: portfoliosPermission.type,
      valueCount: portfoliosPermission.values.length,
    };
    return formatPermissionDisplay(displayInfo, 'Portfolio');
  }, [portfoliosPermission]);

  // Helper to get portfolio name using the lookup hook
  const getPortfolioName = useCallback(
    (portfolio: DefaultPortfolio | NumberedPortfolio) => {
      const ownerDid = portfolio.owner.did;

      // Special case for default portfolio
      if (!('id' in portfolio)) {
        return 'Default Portfolio';
      }

      const portfolioId = portfolio.id.toString();

      // Use the hook to get portfolio info (handles owned, custodied, and stale)
      const portfolioInfo = getPortfolioInfo(ownerDid, portfolioId);

      return `${portfolioId} - ${portfolioInfo.name}`;
    },
    [getPortfolioInfo],
  );

  // Check if each permission type has details to show
  const hasAssetDetails = useMemo(
    () =>
      (assetsPermission.type === 'These' ||
        assetsPermission.type === 'Except') &&
      assetsPermission.values.length > 0,
    [assetsPermission],
  );

  const hasTransactionDetails = useMemo(
    () =>
      transactionsPermission.type === 'These' &&
      transactionsPermission.values.length > 0,
    [transactionsPermission],
  );

  const hasPortfolioDetails = useMemo(
    () =>
      (portfoliosPermission.type === 'These' ||
        portfoliosPermission.type === 'Except') &&
      portfoliosPermission.values.length > 0,
    [portfoliosPermission],
  );

  const hasDetails =
    hasAssetDetails || hasTransactionDetails || hasPortfolioDetails;

  const toggleDetails = useCallback(() => {
    setDetailsExpanded((prev) => !prev);
  }, []);

  const getDetailsButtonLabel = (): string => {
    if (!hasDetails) return 'No details available';
    return detailsExpanded ? 'Hide details' : 'Show details';
  };

  const getTransactionType = (
    extrinsics: string[] | undefined,
  ): { hasSpecific: boolean; isAll: boolean; isNone: boolean } => {
    return {
      hasSpecific: !!(extrinsics && extrinsics.length > 0),
      isAll: extrinsics === undefined,
      isNone: extrinsics !== undefined && extrinsics.length === 0,
    };
  };

  const renderTransactionDisplay = (
    pallet: string,
    extrinsics: string[] | undefined,
  ): React.ReactNode => {
    const type = getTransactionType(extrinsics);
    const extrinsicsText = extrinsics?.join(', ') || '';
    const shouldBreak = type.hasSpecific && extrinsicsText.length > 25;

    if (type.hasSpecific) {
      return (
        <>
          {capitalizeFirstLetter(pallet)} - {shouldBreak && <br />}
          {extrinsicsText}
        </>
      );
    }
    if (type.isAll) {
      return `${capitalizeFirstLetter(pallet)} (all)`;
    }
    if (type.isNone) {
      return `${capitalizeFirstLetter(pallet)} (none)`;
    }
    return null;
  };

  return (
    <StyledSecondaryKeyItem>
      <StyledInfoWrapper>
        <KeyInfo>
          {keyMeta?.name && <KeyName>{keyMeta.name}</KeyName>}
          <KeyAddressWrapper>
            <KeyAddress title={address}>{address}</KeyAddress>
            <CopyToClipboard value={address} />
          </KeyAddressWrapper>
          <KeyBalance>
            {formatBalance(keyBalance)}
            <span> POLYX</span>
          </KeyBalance>
        </KeyInfo>
      </StyledInfoWrapper>

      <StyledDetailsWrapper>
        {/* Assets Permission */}
        <StyledDetailItem>
          <PermissionLabel>Asset permissions</PermissionLabel>
          <StyledDetailValue title={assetsDisplay.title}>
            {assetsDisplay.text}
          </StyledDetailValue>
        </StyledDetailItem>

        {/* Extrinsics Permission */}
        <StyledDetailItem>
          <PermissionLabel>Transaction permissions</PermissionLabel>
          <StyledDetailValue title={extrinsicsDisplay.title}>
            {extrinsicsDisplay.text}
          </StyledDetailValue>
        </StyledDetailItem>

        {/* Portfolios Permission */}
        <StyledDetailItem>
          <PermissionLabel>Portfolio permissions</PermissionLabel>
          <StyledDetailValue title={portfoliosDisplay.title}>
            {portfoliosDisplay.text}
          </StyledDetailValue>
        </StyledDetailItem>
      </StyledDetailsWrapper>

      {detailsExpanded && (
        <PermissionDetails>
          {/* Assets Details */}
          {hasAssetDetails && (
            <PermissionDetailItem $index={0}>
              <PermissionDetailLabel>
                {assetsPermission.type === 'These'
                  ? 'Included Assets:'
                  : 'Excluded Assets:'}
              </PermissionDetailLabel>
              <PermissionDetailList>
                {assetsPermission.values.map((asset) => (
                  <PermissionDetailValue key={asset}>
                    {formatAssetDisplay(asset, allAssets)}
                  </PermissionDetailValue>
                ))}
              </PermissionDetailList>
            </PermissionDetailItem>
          )}

          {/* Extrinsics Details */}
          {hasTransactionDetails && (
            <PermissionDetailItem $index={1}>
              <PermissionDetailLabel>Included Functions:</PermissionDetailLabel>
              <PermissionDetailList>
                {transactionsPermission.values.map((tx) => {
                  const txKey = `${tx.pallet}-${tx.extrinsics?.join('-') || 'all'}`;
                  const displayContent = renderTransactionDisplay(
                    tx.pallet,
                    tx.extrinsics,
                  );

                  return (
                    <PermissionDetailValue key={txKey}>
                      {displayContent}
                    </PermissionDetailValue>
                  );
                })}
              </PermissionDetailList>
            </PermissionDetailItem>
          )}

          {/* Portfolios Details */}
          {hasPortfolioDetails && (
            <PermissionDetailItem $index={2}>
              <PermissionDetailLabel>
                {portfoliosPermission.type === 'These'
                  ? 'Included Portfolios:'
                  : 'Excluded Portfolios:'}
              </PermissionDetailLabel>
              <PermissionDetailList>
                {portfoliosPermission.values.map((portfolio) => {
                  const ownerDid = portfolio.owner.did;
                  const isThirdParty = identity && ownerDid !== identity.did;
                  const shortDid = formatDid(ownerDid);
                  const portfolioName = getPortfolioName(portfolio);
                  const portfolioKey =
                    'id' in portfolio
                      ? `${ownerDid}-${portfolio.id.toString()}`
                      : `${ownerDid}-default`;

                  return (
                    <PortfolioDetailValueWrapper key={portfolioKey}>
                      {isThirdParty && (
                        <PortfolioOwnerDid title={ownerDid}>
                          <span>Owner: {shortDid}</span>
                          <CopyToClipboard value={ownerDid} />
                        </PortfolioOwnerDid>
                      )}
                      <PortfolioInfo>{portfolioName}</PortfolioInfo>
                    </PortfolioDetailValueWrapper>
                  );
                })}
              </PermissionDetailList>
            </PermissionDetailItem>
          )}
        </PermissionDetails>
      )}

      <StyledButtonsWrapper $expanded={detailsExpanded}>
        <Button
          variant="outline"
          onClick={onEdit}
          disabled={isTransactionInProgress}
          title="Edit permissions"
          aria-label="Edit permissions"
        >
          <Icon name="Edit" size="24px" />
          Edit permissions
        </Button>
        <Button
          variant="primary"
          onClick={onRemovePermissions}
          disabled={isTransactionInProgress}
          title="Revoke all permissions from this secondary key"
          aria-label="Revoke permissions"
        >
          <Icon name="CloseIcon" size="24px" />
          Revoke Permissions
        </Button>
        <Button
          variant="primary"
          onClick={onRemoveKey}
          disabled={isTransactionInProgress}
          title="Completely remove this secondary key from your identity"
          aria-label="Remove secondary key"
        >
          <Icon name="CloseIcon" size="24px" />
          Remove Key
        </Button>
        <Button
          variant="secondary"
          onClick={toggleDetails}
          disabled={!hasDetails || isTransactionInProgress}
          title={getDetailsButtonLabel()}
          aria-label={getDetailsButtonLabel()}
          aria-expanded={detailsExpanded}
        >
          <Icon name="ExpandIcon" size="24px" className="expand-icon" />
          Details
        </Button>
      </StyledButtonsWrapper>
    </StyledSecondaryKeyItem>
  );
};
