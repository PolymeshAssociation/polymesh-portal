import React, { useState, useMemo, useCallback } from 'react';
import { Icon, CopyToClipboard } from '~/components';
import { formatDid } from '~/helpers/formatters';
import { useAssetActionsContext } from '../../context';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import type { TabProps } from '../../types';
import {
  TabSection,
  SectionHeader,
  SectionTitle,
  SectionContent,
  GridDataList,
  DataItem,
  ActionButton,
  EmptyState,
  AddButton,
  DetailValue,
  MediatorItem,
  MediatorContainer,
  GroupHeader,
  GroupTitleSection,
  GroupActions,
  GroupContent,
  InlineRow,
  InlineLabel,
  InlineValue,
  DataLabel,
} from '../../styles';
import { ComingSoonModal } from '../modals';

interface TransferRestrictionsSectionProps {
  asset: TabProps['asset'];
}

interface ClaimDetails {
  countryCode?: string;
  accredited?: boolean;
  affiliate?: boolean;
}

interface DisplayRestriction {
  id: string;
  type: 'Count' | 'Percentage' | 'ClaimCount' | 'ClaimPercentage';
  minLimit?: string;
  maxLimit?: string;
  exemptions: number;
  exemptedDids: string[]; // Array of exempted DIDs
  claimType?: string; // For claim-related restrictions
  claimIssuer?: string; // For claim-related restrictions (DID)
  claimDetails?: ClaimDetails; // Additional claim details for enhanced descriptions
}

// Helper function to extract claim details from restriction claim
const extractClaimDetails = (claim: unknown): ClaimDetails => {
  const claimDetails: ClaimDetails = {};
  if (claim && typeof claim === 'object') {
    const claimObj = claim as Record<string, unknown>;
    if (claimObj.countryCode && typeof claimObj.countryCode === 'string') {
      claimDetails.countryCode = claimObj.countryCode;
    }
    if (typeof claimObj.accredited === 'boolean') {
      claimDetails.accredited = claimObj.accredited;
    }
    if (typeof claimObj.affiliate === 'boolean') {
      claimDetails.affiliate = claimObj.affiliate;
    }
  }
  return claimDetails;
};

// Helper function to get claim detail descriptions
const getClaimDetailDescription = (
  claimType: string,
  claimDetails: ClaimDetails,
): string => {
  switch (claimType) {
    case 'Jurisdiction': {
      return 'Jurisdiction';
    }
    case 'Accredited': {
      const isPresent = claimDetails.accredited !== false;
      return `Accredited (${isPresent ? 'Present' : 'Not Present'})`;
    }
    case 'Affiliate': {
      const isPresent = claimDetails.affiliate !== false;
      return `Affiliate (${isPresent ? 'Present' : 'Not Present'})`;
    }
    default:
      return claimType;
  }
};

// Helper function to get better restriction type descriptions
const getRestrictionTypeDescription = (
  restriction: DisplayRestriction,
): string => {
  switch (restriction.type) {
    case 'Count':
      return 'Max. Holder Count';
    case 'Percentage':
      return 'Max Individual Percentage Ownership';
    case 'ClaimCount':
      return 'Claim Holder Count';
    case 'ClaimPercentage':
      return 'Claim Total Percentage Ownership';
    default:
      return restriction.type;
  }
};

export const TransferRestrictionsSection: React.FC<
  TransferRestrictionsSectionProps
> = ({ asset }) => {
  const { transactionInProcess } = useAssetActionsContext();
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  // Create lookup map for O(1) country code access
  const countryLookup = useMemo(() => {
    return new Map(
      countryCodes.map((c: { code: string; name: string }) => [
        c.code.toUpperCase(),
        c.name,
      ]),
    );
  }, []);

  // Optimized jurisdiction country name lookup
  const getJurisdictionCountryName = (countryCode: string): string => {
    return countryLookup.get(countryCode.toUpperCase()) || countryCode;
  };

  const handleManageTransferRestrictions = useCallback(() => {
    setComingSoonFeature('add transfer restriction');
    setComingSoonModalOpen(true);
  }, []);

  const handleEditRestriction = useCallback((restrictionId: string) => {
    setComingSoonFeature('edit transfer restriction');
    setComingSoonModalOpen(true);
    // eslint-disable-next-line no-console
    console.log('Edit restriction:', restrictionId);
  }, []);

  const handleDeleteRestriction = useCallback((restrictionId: string) => {
    setComingSoonFeature('delete transfer restriction');
    setComingSoonModalOpen(true);
    // eslint-disable-next-line no-console
    console.log('Delete restriction:', restrictionId);
  }, []);

  const handleDeleteExemption = useCallback(
    (restrictionId: string, exemptedDid: string) => {
      setComingSoonFeature('delete transfer restriction exemption');
      setComingSoonModalOpen(true);
      // eslint-disable-next-line no-console
      console.log('Delete exemption:', restrictionId, exemptedDid);
    },
    [],
  );

  // Extract and format transfer restrictions from asset data
  const restrictions: DisplayRestriction[] = [];

  // Process Count Transfer Restrictions
  if (asset?.details?.transferRestrictionCount?.restrictions) {
    asset.details.transferRestrictionCount.restrictions.forEach(
      (restriction, index) => {
        const exemptedDids = restriction.exemptedIds || [];
        restrictions.push({
          id: `count-${index}`,
          type: 'Count',
          maxLimit: restriction.count.toString(),
          exemptions: exemptedDids.length,
          exemptedDids,
        });
      },
    );
  }

  // Process Percentage Transfer Restrictions
  if (asset?.details?.transferRestrictionPercentage?.restrictions) {
    asset.details.transferRestrictionPercentage.restrictions.forEach(
      (restriction, index) => {
        const exemptedDids = restriction.exemptedIds || [];
        restrictions.push({
          id: `percentage-${index}`,
          type: 'Percentage',
          maxLimit: `${restriction.percentage.toString()}%`,
          exemptions: exemptedDids.length,
          exemptedDids,
        });
      },
    );
  }

  // Process Claim Count Transfer Restrictions
  if (asset?.details?.transferRestrictionClaimCount?.restrictions) {
    asset.details.transferRestrictionClaimCount.restrictions.forEach(
      (restriction, index) => {
        const claimType = restriction.claim?.type || 'Unknown';
        const issuerDid =
          typeof restriction.issuer === 'string'
            ? restriction.issuer
            : restriction.issuer?.did || 'Unknown';
        const exemptedDids = restriction.exemptedIds || [];
        const claimDetails = extractClaimDetails(restriction.claim);

        restrictions.push({
          id: `claim-count-${index}`,
          type: 'ClaimCount',
          minLimit: restriction.min.toString(),
          maxLimit: restriction.max ? restriction.max.toString() : undefined,
          exemptions: exemptedDids.length,
          exemptedDids,
          claimType,
          claimIssuer: issuerDid,
          claimDetails,
        });
      },
    );
  }

  // Process Claim Percentage Transfer Restrictions
  if (asset?.details?.transferRestrictionClaimPercentage?.restrictions) {
    asset.details.transferRestrictionClaimPercentage.restrictions.forEach(
      (restriction, index) => {
        const claimType = restriction.claim?.type || 'Unknown';
        const issuerDid =
          typeof restriction.issuer === 'string'
            ? restriction.issuer
            : restriction.issuer?.did || 'Unknown';
        const exemptedDids = restriction.exemptedIds || [];
        const claimDetails = extractClaimDetails(restriction.claim);

        restrictions.push({
          id: `claim-percentage-${index}`,
          type: 'ClaimPercentage',
          minLimit: `${restriction.min.toString()}%`,
          maxLimit: `${restriction.max.toString()}%`,
          exemptions: exemptedDids.length,
          exemptedDids,
          claimType,
          claimIssuer: issuerDid,
          claimDetails,
        });
      },
    );
  }

  return (
    <>
      <TabSection>
        <SectionHeader>
          <SectionTitle>Transfer Restrictions</SectionTitle>
          <AddButton
            onClick={handleManageTransferRestrictions}
            disabled={transactionInProcess}
          >
            <Icon name="Plus" size="16px" />
            Add Restrictions
          </AddButton>
        </SectionHeader>
        <SectionContent>
          {restrictions.length > 0 ? (
            <GridDataList>
              {restrictions.map((restriction) => (
                <DataItem key={restriction.id}>
                  {/* Header with restriction type and action buttons */}
                  <GroupHeader>
                    <GroupTitleSection>
                      <InlineRow>
                        <InlineLabel>Type</InlineLabel>
                        <InlineValue>
                          {getRestrictionTypeDescription(restriction)}
                        </InlineValue>
                      </InlineRow>
                    </GroupTitleSection>

                    {/* Action buttons in top-right corner */}
                    <GroupActions>
                      <ActionButton
                        onClick={() => handleEditRestriction(restriction.id)}
                        title="Edit Restriction"
                        disabled={transactionInProcess}
                      >
                        <Icon name="Edit" size="14px" />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDeleteRestriction(restriction.id)}
                        title="Delete Restriction"
                        disabled={transactionInProcess}
                      >
                        <Icon name="Delete" size="14px" />
                      </ActionButton>
                    </GroupActions>
                  </GroupHeader>

                  {/* Content section */}
                  <GroupContent>
                    {restriction.claimType && (
                      <InlineRow>
                        <InlineLabel>Claim Type</InlineLabel>
                        <InlineValue>
                          {getClaimDetailDescription(
                            restriction.claimType,
                            restriction.claimDetails || {},
                          )}
                        </InlineValue>
                      </InlineRow>
                    )}

                    {restriction.claimType === 'Jurisdiction' &&
                      restriction.claimDetails?.countryCode && (
                        <InlineRow>
                          <InlineLabel>Jurisdiction</InlineLabel>
                          <InlineValue>
                            {getJurisdictionCountryName(
                              restriction.claimDetails.countryCode,
                            )}
                          </InlineValue>
                        </InlineRow>
                      )}

                    {restriction.claimIssuer && (
                      <InlineRow>
                        <InlineLabel>Claim Issuer</InlineLabel>
                        <InlineValue>
                          {formatDid(restriction.claimIssuer, 8, 8)}
                          <CopyToClipboard value={restriction.claimIssuer} />
                        </InlineValue>
                      </InlineRow>
                    )}

                    {restriction.maxLimit && (
                      <InlineRow>
                        <InlineLabel>Max Limit</InlineLabel>
                        <InlineValue>{restriction.maxLimit}</InlineValue>
                      </InlineRow>
                    )}

                    {restriction.minLimit && (
                      <InlineRow>
                        <InlineLabel>Min Limit</InlineLabel>
                        <InlineValue>{restriction.minLimit}</InlineValue>
                      </InlineRow>
                    )}

                    {restriction.exemptions > 0 && (
                      <>
                        <DataLabel>Exemptions</DataLabel>
                        <MediatorContainer>
                          {restriction.exemptedDids.map((did, index) => (
                            <MediatorItem
                              key={did}
                              $isLast={
                                index === restriction.exemptedDids.length - 1
                              }
                            >
                              <DetailValue>
                                {formatDid(did, 8, 8)}
                                <CopyToClipboard value={did} />
                              </DetailValue>
                              <ActionButton
                                onClick={() =>
                                  handleDeleteExemption(restriction.id, did)
                                }
                                disabled={transactionInProcess}
                              >
                                <Icon name="Delete" size="14px" />
                              </ActionButton>
                            </MediatorItem>
                          ))}
                        </MediatorContainer>
                      </>
                    )}
                  </GroupContent>
                </DataItem>
              ))}
            </GridDataList>
          ) : (
            <EmptyState>
              No transfer restrictions configured. Transfer restrictions limit
              how many tokens can be held by individuals or groups.
            </EmptyState>
          )}
        </SectionContent>
      </TabSection>

      <ComingSoonModal
        isOpen={comingSoonModalOpen}
        onClose={() => setComingSoonModalOpen(false)}
        feature={comingSoonFeature}
      />
    </>
  );
};
