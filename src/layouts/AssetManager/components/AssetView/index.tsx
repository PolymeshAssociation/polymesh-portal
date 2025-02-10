import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAssetDetails } from '~/hooks/polymesh/useAssetDetails';
import { Icon, CopyToClipboard, LoadingFallback } from '~/components';
import { Button } from '~/components/UiKit';
import { formatUuid } from '~/helpers/formatters';
import { toFormattedTimestamp } from '~/helpers/dateTime';
import type { TIcons } from '~/assets/icons/types';
import {
  Container,
  Section,
  SectionHeader,
  SectionTitle,
  EditButton,
  Grid,
  PropertyItem,
  PropertyLabel,
  PropertyValue,
  DocumentsList,
  DocumentItem,
  DocumentInfo,
  DocumentName,
  DocumentLink,
  MetadataList,
  MetadataItem,
  ActionButtons,
  SectionContent,
  IconWrapper,
  AddButton,
  FeaturesList,
  FeatureItem,
  FeatureInfo,
  FeatureTitle,
  FeatureDescription,
  ActionsGrid,
  ActionButton,
} from './styles';
import NotFound from '~/layouts/NotFound';

type FeatureId = keyof typeof availableFeatures;

const availableFeatures = {
  'security-identifiers': {
    title: 'Security Identifiers',
    description: 'Define ISIN, CUSIP and other security identifiers',
  },
  metadata: {
    title: 'Metadata',
    description: 'Add descriptive data about the asset',
  },
  documents: {
    title: 'Documents',
    description: 'Upload legal and regulatory documents',
  },
  'required-mediators': {
    title: 'Required Mediators',
    description: 'Add mediators to oversee transfers',
  },
  'venue-filtering': {
    title: 'Venue Filtering',
    description: 'Control which venues can trade this asset',
  },
  'compliance-rules': {
    title: 'Compliance Rules',
    description: 'Configure compliance requirements using claim rules',
  },
  'transfer-restrictions': {
    title: 'Transfer Restrictions',
    description: 'Set restrictions on token transfers for fungible assets',
  },
} as const;

interface AssetAction {
  icon: TIcons;
  label: string;
  action: () => void;
}

export const AssetView = () => {
  const { assetId } = useParams();
  const { assetDetails, assetDetailsLoading } = useAssetDetails(assetId);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({
    'security-identifiers': true,
    metadata: true,
    documents: true,
    'required-mediators': true,
    'venue-filtering': true,
  });

  const toggleSection = (sectionId: string) => {
    if (sectionId === 'basic-info') return;
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const renderSection = (
    id: string,
    title: string,
    content: React.ReactNode,
    isEmpty: boolean,
    showEdit = true,
  ) => {
    // Don't render empty sections
    if (isEmpty && id !== 'basic-info') {
      return null;
    }

    const isExpanded = id === 'basic-info' ? true : !collapsedSections[id];
    return (
      <Section>
        <SectionHeader
          onClick={() => toggleSection(id)}
          $isExpanded={isExpanded}
        >
          <SectionTitle>{title}</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {showEdit && isExpanded && (
              <EditButton onClick={(e) => e.stopPropagation()}>
                <Icon name="Edit" size="16px" />
                Edit
              </EditButton>
            )}
            {id !== 'basic-info' && (
              <IconWrapper $isExpanded={isExpanded}>
                <Icon name="ExpandIcon" size="24px" />
              </IconWrapper>
            )}
          </div>
        </SectionHeader>
        <SectionContent $isExpanded={isExpanded}>{content}</SectionContent>
      </Section>
    );
  };

  if (assetDetailsLoading) {
    return <LoadingFallback main />;
  }

  if (!assetDetails?.details) {
    return <NotFound />;
  }

  const { details, docs } = assetDetails;

  const getMissingFeatures = () => {
    const missing: FeatureId[] = [];
    if (!details.assetIdentifiers?.length) missing.push('security-identifiers');
    if (!details.metaData?.length) missing.push('metadata');
    if (!docs?.length) missing.push('documents');
    if (!details.requiredMediators?.length) missing.push('required-mediators');
    if (!details.venueFilteringEnabled) missing.push('venue-filtering');
    // Always show compliance rules in Available Features
    missing.push('compliance-rules');
    // Only show transfer restrictions for fungible assets
    if (!details.isNftCollection) {
      missing.push('transfer-restrictions');
    }
    return missing;
  };

  const renderActions = () => {
    const commonActions: AssetAction[] = [
      { icon: 'Edit', label: 'Transfer Ownership', action: () => {} },
    ];

    if (details.ticker) {
      commonActions.push({
        icon: 'Delete',
        label: 'Unlink Ticker',
        action: () => {},
      });
    } else {
      commonActions.push({
        icon: 'Link',
        label: 'Link Ticker',
        action: () => {},
      });
    }

    const fungibleActions: AssetAction[] = [
      { icon: 'Coins', label: 'Issue Tokens', action: () => {} },
      { icon: 'Refresh', label: 'Redeem Tokens', action: () => {} },
      {
        icon: 'LockIcon',
        label: details.isFrozen ? 'Unfreeze Transfers' : 'Freeze Transfers',
        action: () => {},
      },
    ];

    const nftActions: AssetAction[] = [
      { icon: 'Plus', label: 'Issue NFT', action: () => {} },
      {
        icon: 'LockIcon',
        label: details.isFrozen ? 'Unfreeze Collection' : 'Freeze Collection',
        action: () => {},
      },
    ];

    const actions = [
      ...commonActions,
      ...(details.isNftCollection ? nftActions : fungibleActions),
    ];

    return (
      <ActionsGrid>
        {actions.map(({ icon, label, action }) => (
          <ActionButton key={label} variant="modalSecondary" onClick={action}>
            <Icon name={icon} size="16px" />
            {label}
          </ActionButton>
        ))}
      </ActionsGrid>
    );
  };

  return (
    <Container>
      {renderSection(
        'basic-info',
        'Basic Information',
        <Grid>
          <PropertyItem>
            <PropertyLabel>Asset ID</PropertyLabel>
            <PropertyValue>
              {formatUuid(assetId || '')}
              <CopyToClipboard value={assetId || ''} />
            </PropertyValue>
          </PropertyItem>
          <PropertyItem>
            <PropertyLabel>Name</PropertyLabel>
            <PropertyValue>{details.name}</PropertyValue>
          </PropertyItem>
          <PropertyItem>
            <PropertyLabel>Asset Type</PropertyLabel>
            <PropertyValue>{details.assetType}</PropertyValue>
          </PropertyItem>
          <PropertyItem>
            <PropertyLabel>Owner</PropertyLabel>
            <PropertyValue>
              {formatUuid(details.owner)}
              <CopyToClipboard value={details.owner} />
            </PropertyValue>
          </PropertyItem>
          <PropertyItem>
            <PropertyLabel>Total Supply</PropertyLabel>
            <PropertyValue>{details.totalSupply}</PropertyValue>
          </PropertyItem>
          <PropertyItem>
            <PropertyLabel>Created At</PropertyLabel>
            <PropertyValue>
              {details.createdAt
                ? toFormattedTimestamp(
                    details.createdAt,
                    'YYYY-MM-DD / HH:mm:ss',
                  )
                : 'N/A'}
            </PropertyValue>
          </PropertyItem>
          <PropertyItem>
            <PropertyLabel>Type</PropertyLabel>
            <PropertyValue>
              {details.isNftCollection ? 'NFT Collection' : 'Fungible'}
            </PropertyValue>
          </PropertyItem>
          {details.fundingRound && (
            <PropertyItem>
              <PropertyLabel>Funding Round</PropertyLabel>
              <PropertyValue>{details.fundingRound}</PropertyValue>
            </PropertyItem>
          )}
        </Grid>,
        false,
      )}

      {renderSection(
        'security-identifiers',
        'Security Identifiers',
        <Grid>
          {details.assetIdentifiers.map((identifier) => (
            <PropertyItem key={`${identifier.type}-${identifier.value}`}>
              <PropertyLabel>{identifier.type}</PropertyLabel>
              <PropertyValue>
                {identifier.value}
                <CopyToClipboard value={identifier.value} />
              </PropertyValue>
            </PropertyItem>
          ))}
        </Grid>,
        details.assetIdentifiers.length === 0,
      )}

      {renderSection(
        'metadata',
        'Metadata',
        <MetadataList>
          {details.metaData.map((meta) => (
            <MetadataItem key={`${meta.name}-${meta.value}`}>
              <DocumentInfo>
                <DocumentName>{meta.name}</DocumentName>
                <PropertyLabel>Value: {meta.value}</PropertyLabel>
                {meta.expiry && (
                  <PropertyLabel>
                    Expires:{' '}
                    {toFormattedTimestamp(meta.expiry, 'YYYY-MM-DD / HH:mm:ss')}
                  </PropertyLabel>
                )}
                {meta.isLocked && (
                  <PropertyLabel>Lock Status: {meta.isLocked}</PropertyLabel>
                )}
              </DocumentInfo>
              <ActionButtons>
                <Button variant="modalSecondary">
                  <Icon name="Edit" size="16px" />
                </Button>
                <Button variant="modalSecondary">
                  <Icon name="Delete" size="16px" />
                </Button>
              </ActionButtons>
            </MetadataItem>
          ))}
        </MetadataList>,
        details.metaData.length === 0,
      )}

      {renderSection(
        'documents',
        'Documents',
        <DocumentsList>
          {docs?.map((doc) => (
            <DocumentItem key={`${doc.name}-${doc.uri}`}>
              <DocumentInfo>
                <DocumentName>{doc.name}</DocumentName>
                <DocumentLink
                  href={doc.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Document
                </DocumentLink>
              </DocumentInfo>
              <ActionButtons>
                <Button variant="modalSecondary">
                  <Icon name="Edit" size="16px" />
                </Button>
                <Button variant="modalSecondary">
                  <Icon name="Delete" size="16px" />
                </Button>
              </ActionButtons>
            </DocumentItem>
          ))}
        </DocumentsList>,
        !docs || docs.length === 0,
      )}

      {renderSection(
        'required-mediators',
        'Required Mediators',
        <Grid>
          {details.requiredMediators.map((mediator) => (
            <PropertyItem key={mediator}>
              <PropertyLabel>Mediator</PropertyLabel>
              <PropertyValue>
                {formatUuid(mediator)}
                <CopyToClipboard value={mediator} />
              </PropertyValue>
            </PropertyItem>
          ))}
        </Grid>,
        details.requiredMediators.length === 0,
      )}

      {renderSection(
        'venue-filtering',
        'Venue Filtering',
        <Grid>
          <PropertyItem>
            <PropertyLabel>Status</PropertyLabel>
            <PropertyValue>
              {details.venueFilteringEnabled ? 'Enabled' : 'Disabled'}
            </PropertyValue>
          </PropertyItem>
          {details.venueFilteringEnabled && (
            <PropertyItem>
              <PropertyLabel>Permitted Venues</PropertyLabel>
              <PropertyValue>
                {details.permittedVenuesIds.join(', ') || 'None'}
                {details.permittedVenuesIds.length > 0 && (
                  <CopyToClipboard
                    value={details.permittedVenuesIds.join(', ')}
                  />
                )}
              </PropertyValue>
            </PropertyItem>
          )}
        </Grid>,
        !details.venueFilteringEnabled &&
          (!details.permittedVenuesIds ||
            details.permittedVenuesIds.length === 0),
      )}

      <Section>
        <SectionHeader $isExpanded>
          <SectionTitle>Asset Actions</SectionTitle>
        </SectionHeader>
        <SectionContent $isExpanded>{renderActions()}</SectionContent>
      </Section>

      {getMissingFeatures().length > 0 && (
        <Section>
          <SectionHeader $isExpanded>
            <SectionTitle>Available Features</SectionTitle>
          </SectionHeader>
          <FeaturesList>
            {getMissingFeatures().map((feature) => (
              <FeatureItem key={feature}>
                <FeatureInfo>
                  <FeatureTitle>
                    {availableFeatures[feature].title}
                  </FeatureTitle>
                  <FeatureDescription>
                    {availableFeatures[feature].description}
                  </FeatureDescription>
                </FeatureInfo>
                <AddButton>
                  <Icon name="Plus" size="16px" />
                  Add
                </AddButton>
              </FeatureItem>
            ))}
          </FeaturesList>
        </Section>
      )}
    </Container>
  );
};

export default AssetView;
