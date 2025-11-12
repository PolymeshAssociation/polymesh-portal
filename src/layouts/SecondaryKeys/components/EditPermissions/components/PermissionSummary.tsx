import { useCallback, useContext, useMemo } from 'react';
import CopyToClipboard from '~/components/CopyToClipboard';
import { AccountContext } from '~/context/AccountContext';
import { AssetContext } from '~/context/AssetContext';
import { formatDid } from '~/helpers/formatters';
import { usePortfolioLookup } from '~/hooks/polymesh/usePortfolioLookup';
import {
  ExtrinsicPermissionScopeType,
  PermissionScopeType,
} from '~/layouts/SecondaryKeys/types';
import {
  AssetDetails,
  deduplicateAssetsByID,
  formatAssetDisplay,
} from '../../../utils';
import {
  SelectedItem,
  SelectedItemsList,
  SummaryCard,
  SummaryPortfolioDetailWrapper,
  SummaryPortfolioMainLine,
  SummaryPortfolioOwnerDid,
  SummarySection,
  SummaryStaleText,
  SummaryText,
  SummaryTitle,
} from '../styles';

interface IPermissionSummaryProps {
  secondaryKey: string;
  permissions: {
    assets: {
      type: PermissionScopeType;
      values: string[];
    };
    transactions: {
      type: ExtrinsicPermissionScopeType;
      values: Array<{ pallet: string; extrinsics?: string[] | null }>;
    };
    portfolios: {
      type: PermissionScopeType;
      values: Array<{ id: string; name?: string; ownerDid?: string }>;
    };
  };
  resolvedAssets: AssetDetails[];
}

export const PermissionSummary = ({
  secondaryKey,
  permissions,
  resolvedAssets,
}: IPermissionSummaryProps) => {
  const { ownedAssets, managedAssets } = useContext(AssetContext);
  const { identity } = useContext(AccountContext);

  // Use the shared portfolio lookup hook
  const { getPortfolioInfo } = usePortfolioLookup(
    permissions.portfolios.values.map((p) => ({
      id: p.id,
      ownerDid: p.ownerDid,
      name: p.name,
    })),
  );

  const formatTransactionLabel = useMemo(
    () => (pallet: string, extrinsic?: string) => {
      const formattedPallet = pallet
        ? `${pallet.charAt(0).toUpperCase()}${pallet.slice(1)}`
        : pallet;
      return extrinsic
        ? `${formattedPallet} - ${extrinsic}`
        : `${formattedPallet} - All ${formattedPallet} Transactions`;
    },
    [],
  );

  // Combine all available assets and deduplicate
  const allAssets = useMemo(
    () => deduplicateAssetsByID(ownedAssets, managedAssets, resolvedAssets),
    [ownedAssets, managedAssets, resolvedAssets],
  );

  const formatPermissionType = (
    type: PermissionScopeType | ExtrinsicPermissionScopeType,
  ): string => {
    switch (type) {
      case 'Whole':
        return 'Full access';
      case 'These':
        return 'Specific items only';
      case 'Except':
        return 'All except specific items';
      case 'None':
        return 'No access';
      default:
        return 'Unknown';
    }
  };

  const renderPortfolioItem = useCallback(
    (portfolio: { id: string; name?: string; ownerDid?: string }) => {
      // Use the hook to get portfolio information (handles context lookup and fetching)
      const portfolioInfo = getPortfolioInfo(portfolio.ownerDid, portfolio.id);

      const isThirdParty =
        identity && portfolio.ownerDid && portfolio.ownerDid !== identity.did;

      const displayText =
        portfolio.id === 'default'
          ? 'Default Portfolio'
          : `${portfolio.id} - ${portfolioInfo.name}`;

      return (
        <SummaryPortfolioDetailWrapper>
          <SummaryPortfolioMainLine>
            {displayText}
            {isThirdParty && portfolio.ownerDid && (
              <SummaryPortfolioOwnerDid title={portfolio.ownerDid}>
                <span>Owner: {formatDid(portfolio.ownerDid, 6, 4)}</span>
                <CopyToClipboard value={portfolio.ownerDid} />
              </SummaryPortfolioOwnerDid>
            )}
            {portfolioInfo.isStale && (
              <SummaryStaleText>⚠️ Not controlled</SummaryStaleText>
            )}
          </SummaryPortfolioMainLine>
        </SummaryPortfolioDetailWrapper>
      );
    },
    [getPortfolioInfo, identity],
  );

  return (
    <SummarySection>
      <SummaryCard>
        <SummaryTitle>Secondary Key</SummaryTitle>
        <SummaryText>{secondaryKey || 'Not selected'}</SummaryText>
      </SummaryCard>

      <SummaryCard>
        <SummaryTitle>Assets Permission</SummaryTitle>
        <SummaryText>
          {formatPermissionType(permissions.assets.type)}
        </SummaryText>
        {permissions.assets.values.length > 0 && (
          <SelectedItemsList>
            {permissions.assets.values.map((assetId) => (
              <SelectedItem key={assetId}>
                {formatAssetDisplay(assetId, allAssets)}
              </SelectedItem>
            ))}
          </SelectedItemsList>
        )}
      </SummaryCard>

      <SummaryCard>
        <SummaryTitle>Transactions Permission</SummaryTitle>
        <SummaryText>
          {formatPermissionType(permissions.transactions.type)}
        </SummaryText>
        {permissions.transactions.values.length > 0 && (
          <SelectedItemsList>
            {permissions.transactions.values.flatMap((item) => {
              // If extrinsics is null, show "Pallet - All Transactions"
              if (item.extrinsics === null) {
                return (
                  <SelectedItem key={item.pallet}>
                    {formatTransactionLabel(item.pallet)}
                  </SelectedItem>
                );
              }

              return item.extrinsics && item.extrinsics.length > 0
                ? item.extrinsics.map((extrinsic) => (
                    <SelectedItem key={`${item.pallet}.${extrinsic}`}>
                      {formatTransactionLabel(item.pallet, extrinsic)}
                    </SelectedItem>
                  ))
                : [];
            })}
          </SelectedItemsList>
        )}
      </SummaryCard>

      <SummaryCard>
        <SummaryTitle>Portfolios Permission</SummaryTitle>
        <SummaryText>
          {formatPermissionType(permissions.portfolios.type)}
        </SummaryText>
        {permissions.portfolios.values.length > 0 && (
          <SelectedItemsList>
            {permissions.portfolios.values.map((portfolio) => {
              // Use composite key to ensure uniqueness (ownerDid + portfolioId)
              const portfolioKey = portfolio.ownerDid
                ? `${portfolio.ownerDid}-${portfolio.id}`
                : portfolio.id;
              return (
                <SelectedItem key={portfolioKey}>
                  {renderPortfolioItem(portfolio)}
                </SelectedItem>
              );
            })}
          </SelectedItemsList>
        )}
      </SummaryCard>
    </SummarySection>
  );
};
