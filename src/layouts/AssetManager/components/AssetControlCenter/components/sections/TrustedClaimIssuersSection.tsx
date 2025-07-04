import React, { useMemo, useState } from 'react';
import { Icon, CopyToClipboard } from '~/components';
import { formatUuid } from '~/helpers/formatters';
import { ComingSoonModal } from '../modals';
import type { TabProps, TrustedClaimIssuer } from '../../types';
import {
  TabSection,
  SectionHeader,
  SectionTitle,
  SectionContent,
  DataList,
  DataItem,
  DataLabel,
  DataValue,
  ActionButton,
  EmptyState,
  AddButton,
  GroupHeader,
  GroupTitleSection,
  GroupActions,
  GroupContent,
} from '../../styles';

interface TrustedClaimIssuersSectionProps {
  asset: TabProps['asset'];
}

export const TrustedClaimIssuersSection: React.FC<
  TrustedClaimIssuersSectionProps
> = ({ asset }) => {
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  // Helper function to format claim types for display
  const formatClaimTypes = (trustedFor: string[] | null): string => {
    if (trustedFor === null) {
      return 'All Claim Types';
    }
    if (trustedFor.length === 0) {
      return 'No Claim Types';
    }

    // Format each claim type for display
    const formattedClaims = trustedFor.map((claimType) => {
      if (claimType === 'Custom') {
        // TODO: Custom claim types are broken in SDK - doesn't return associated custom claim ID
        return 'Custom Claim (ID not available)';
      }
      // Convert camelCase to readable format
      return claimType.replace(/([A-Z])/g, ' $1').trim();
    });

    return formattedClaims.join(', ');
  };

  const handleManageTrustedIssuers = () => {
    setComingSoonFeature('manage trusted claim issuer');
    setComingSoonModalOpen(true);
  };

  const handleDeleteTrustedIssuer = (issuerId: string) => {
    setComingSoonFeature('delete trusted claim issuer');
    setComingSoonModalOpen(true);
    // eslint-disable-next-line no-console
    console.log('Delete trusted issuer:', issuerId);
  };

  const trustedClaimIssuers: TrustedClaimIssuer[] = useMemo(() => {
    if (!asset?.details?.complianceRequirements?.defaultTrustedClaimIssuers) {
      return [];
    }

    return asset.details.complianceRequirements.defaultTrustedClaimIssuers.map(
      (issuer) => ({
        id: issuer.identity.did,
        trustedFor: issuer.trustedFor,
      }),
    );
  }, [asset?.details?.complianceRequirements?.defaultTrustedClaimIssuers]);

  return (
    <>
      <TabSection>
        <SectionHeader>
          <SectionTitle>Default Trusted Claim Issuers</SectionTitle>
          <AddButton onClick={handleManageTrustedIssuers}>
            <Icon name="Plus" size="16px" />
            Add Trusted Claim Issuer
          </AddButton>
        </SectionHeader>
        <SectionContent>
          {trustedClaimIssuers.length > 0 ? (
            <DataList className="two-column">
              {trustedClaimIssuers.map((issuer) => (
                <DataItem key={issuer.id}>
                  {/* Header with issuer name and action buttons */}
                  <GroupHeader>
                    <GroupTitleSection>
                      <DataLabel>Trusted Claim Issuer</DataLabel>
                      <DataValue
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        {formatUuid(issuer.id)}
                        <CopyToClipboard value={issuer.id} />
                      </DataValue>
                    </GroupTitleSection>

                    {/* Action buttons in top-right corner */}
                    <GroupActions>
                      <ActionButton
                        onClick={() => handleDeleteTrustedIssuer(issuer.id)}
                      >
                        <Icon name="Delete" size="14px" />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleManageTrustedIssuers()}
                      >
                        <Icon name="Edit" size="14px" />
                      </ActionButton>
                    </GroupActions>
                  </GroupHeader>

                  {/* Content section */}
                  <GroupContent>
                    <DataLabel>Trusted For Claims</DataLabel>
                    <DataValue>{formatClaimTypes(issuer.trustedFor)}</DataValue>
                  </GroupContent>
                </DataItem>
              ))}
            </DataList>
          ) : (
            <EmptyState>
              No default trusted claim issuers configured. Trusted issuers can
              provide claims that are automatically trusted for compliance
              checks.
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
