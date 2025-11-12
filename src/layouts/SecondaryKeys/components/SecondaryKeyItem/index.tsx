import { useContext, useState, useMemo, useCallback } from 'react';
import { Icon } from '~/components';
import { Button } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { formatBalance } from '~/helpers/formatters';
import {
  StyledSecondaryKeyItem,
  StyledInfoWrapper,
  KeyInfo,
  KeyName,
  KeyAddress,
  KeyBalance,
  StyledDetailsWrapper,
  StyledDetailItem,
  PermissionLabel,
  StyledDetailValue,
  PermissionDetails,
  PermissionDetailItem,
  PermissionDetailLabel,
  PermissionDetailList,
  PermissionDetailValue,
  StyledButtonsWrapper,
} from './styles';
import { ISecondaryKeyData, IPermissionData, ITransactionPermissionData } from './helpers';

interface ISecondaryKeyItemProps {
  data: ISecondaryKeyData;
  onEdit: () => void;
  onRemove: () => void;
}

// Helper function to format permission display
const formatPermissionDisplay = (
  permission: IPermissionData | ITransactionPermissionData,
  label: string
): { text: string; title: string } => {
  const count = permission.values?.length || 0;
  
  switch (permission.type) {
    case 'Whole':
      return {
        text: `✅ All ${label}`,
        title: `All ${label}`,
      };
    case 'None':
      return {
        text: `❌ No ${label}`,
        title: `No ${label}`,
      };
    case 'These':
      return {
        text: `✅ ${count} ${label}${count === 1 ? '' : 's'}`,
        title: `${count} specific ${label.toLowerCase()}${count === 1 ? '' : 's'}`,
      };
    case 'Except':
      return {
        text: `❌ All Except ${count}`,
        title: `All except ${count} ${label.toLowerCase()}${count === 1 ? '' : 's'}`,
      };
    default:
      return { text: '', title: '' };
  }
};

export const SecondaryKeyItem = ({
  data,
  onEdit,
  onRemove,
}: ISecondaryKeyItemProps) => {
  const { allAccountsWithMeta, allKeyInfo } = useContext(AccountContext);
  const { allPortfolios } = useContext(PortfolioContext);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  
  // Memoize key metadata lookups
  const keyMeta = useMemo(
    () => allAccountsWithMeta.find(({ address }) => address === data.address)?.meta,
    [allAccountsWithMeta, data.address]
  );

  const keyBalance = useMemo(
    () => allKeyInfo.find(({ key }) => key === data.address)?.totalBalance || '0',
    [allKeyInfo, data.address]
  );

  // Format permission displays
  const assetsDisplay = useMemo(
    () => formatPermissionDisplay(data.permissions.assets, 'Asset'),
    [data.permissions.assets]
  );
  const extrinsicsDisplay = useMemo(
    () => formatPermissionDisplay(data.permissions.transactions, 'Function'),
    [data.permissions.transactions]
  );
  const portfoliosDisplay = useMemo(
    () => formatPermissionDisplay(data.permissions.portfolios, 'Portfolio'),
    [data.permissions.portfolios]
  );

  // Helper to format portfolio display as "ID / Name"
  const formatPortfolioDisplay = useCallback((portfolioValue: string) => {
    // portfolioValue format is "DID/portfolioId"
    const parts = portfolioValue.split('/');
    if (parts.length !== 2) return portfolioValue;
    
    const portfolioId = parts[1];
    const portfolio = allPortfolios.find((p) => p.id === portfolioId);
    
    if (portfolio) {
      return `${portfolioId} / ${portfolio.name}`;
    }
    
    return portfolioId === '0' || portfolioId === 'default' 
      ? '0 / Default Portfolio' 
      : portfolioId;
  }, [allPortfolios]);

  const toggleDetails = useCallback(() => {
    setDetailsExpanded((prev) => !prev);
  }, []);

  // Check if there are any details to show
  const hasDetails = useMemo(() => {
    const hasAssets = data.permissions.assets.type !== 'Whole' && 
                      data.permissions.assets.type !== 'None' && 
                      data.permissions.assets.values && 
                      data.permissions.assets.values.length > 0;
    
    const hasTransactions = data.permissions.transactions.type === 'These' && 
                            data.permissions.transactions.values && 
                            data.permissions.transactions.values.length > 0;
    
    const hasPortfolios = data.permissions.portfolios.type !== 'Whole' && 
                          data.permissions.portfolios.type !== 'None' && 
                          data.permissions.portfolios.values && 
                          data.permissions.portfolios.values.length > 0;
    
    return hasAssets || hasTransactions || hasPortfolios;
  }, [data.permissions]);

  return (
    <StyledSecondaryKeyItem>
      <StyledInfoWrapper>
        <KeyInfo>
          {keyMeta?.name && <KeyName>{keyMeta.name}</KeyName>}
          <KeyAddress title={data.address}>{data.address}</KeyAddress>
          <KeyBalance>
            {formatBalance(keyBalance)}
            <span> POLYX</span>
          </KeyBalance>
        </KeyInfo>
      </StyledInfoWrapper>

      <StyledDetailsWrapper>
        {/* Assets Permission */}
        <StyledDetailItem>
          <PermissionLabel>Assets</PermissionLabel>
          <StyledDetailValue title={assetsDisplay.title}>
            {assetsDisplay.text}
          </StyledDetailValue>
        </StyledDetailItem>

        {/* Extrinsics Permission */}
        <StyledDetailItem>
          <PermissionLabel>Extrinsics</PermissionLabel>
          <StyledDetailValue title={extrinsicsDisplay.title}>
            {extrinsicsDisplay.text}
          </StyledDetailValue>
        </StyledDetailItem>

        {/* Portfolios Permission */}
        <StyledDetailItem>
          <PermissionLabel>Portfolios</PermissionLabel>
          <StyledDetailValue title={portfoliosDisplay.title}>
            {portfoliosDisplay.text}
          </StyledDetailValue>
        </StyledDetailItem>
      </StyledDetailsWrapper>

      {detailsExpanded && (
        <PermissionDetails>
          {/* Assets Details */}
          {data.permissions.assets.type !== 'Whole' && data.permissions.assets.type !== 'None' && data.permissions.assets.values && data.permissions.assets.values.length > 0 && (
            <PermissionDetailItem>
              <PermissionDetailLabel>
                {data.permissions.assets.type === 'These' ? 'Included Assets:' : 'Excluded Assets:'}
              </PermissionDetailLabel>
              <PermissionDetailList>
                {data.permissions.assets.values.map((asset) => (
                  <PermissionDetailValue key={asset}>{asset}</PermissionDetailValue>
                ))}
              </PermissionDetailList>
            </PermissionDetailItem>
          )}

          {/* Extrinsics Details */}
          {data.permissions.transactions.type === 'These' && data.permissions.transactions.values && data.permissions.transactions.values.length > 0 && (
            <PermissionDetailItem>
              <PermissionDetailLabel>Included Functions:</PermissionDetailLabel>
              <PermissionDetailList>
                {data.permissions.transactions.values.map((tx, idx) => (
                  <PermissionDetailValue key={idx}>
                    {tx.pallet}{tx.extrinsics && tx.extrinsics.length > 0 ? `.${tx.extrinsics.join(', ')}` : ''}
                  </PermissionDetailValue>
                ))}
              </PermissionDetailList>
            </PermissionDetailItem>
          )}

          {/* Portfolios Details */}
          {data.permissions.portfolios.type !== 'Whole' && data.permissions.portfolios.type !== 'None' && data.permissions.portfolios.values && data.permissions.portfolios.values.length > 0 && (
            <PermissionDetailItem>
              <PermissionDetailLabel>
                {data.permissions.portfolios.type === 'These' ? 'Included Portfolios:' : 'Excluded Portfolios:'}
              </PermissionDetailLabel>
              <PermissionDetailList>
                {data.permissions.portfolios.values.map((portfolio) => (
                  <PermissionDetailValue key={portfolio}>
                    {formatPortfolioDisplay(portfolio)}
                  </PermissionDetailValue>
                ))}
              </PermissionDetailList>
            </PermissionDetailItem>
          )}
        </PermissionDetails>
      )}

      <StyledButtonsWrapper $expanded={detailsExpanded}>
        <Button onClick={onEdit} title="Edit permissions" aria-label="Edit permissions">
          <Icon name="Edit" size="24px" />
          Edit
        </Button>
        <Button onClick={onRemove} title="Remove permissions" aria-label="Remove permissions">
          <Icon name="CloseIcon" size="24px" />
          Remove
        </Button>
        <Button 
          variant="secondary"
          onClick={toggleDetails}
          disabled={!hasDetails}
          title={hasDetails ? (detailsExpanded ? "Hide details" : "Show details") : "No details available"}
          aria-label={hasDetails ? (detailsExpanded ? "Hide details" : "Show details") : "No details available"}
          aria-expanded={detailsExpanded}
        >
          <Icon name="ExpandIcon" size="24px" className="expand-icon" />
          Details
        </Button>
      </StyledButtonsWrapper>
    </StyledSecondaryKeyItem>
  );
};
