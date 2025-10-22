import { TrustedFor } from '@polymeshassociation/polymesh-sdk/types';
import React, { useMemo, useState } from 'react';
import { ConfirmationModal, CopyToClipboard, Icon } from '~/components';
import { formatUuid } from '~/helpers/formatters';
import { useAssetActionsContext } from '../../context';
import {
  ActionButton,
  AddButton,
  DataItem,
  DataLabel,
  DataList,
  DataValue,
  EmptyState,
  GroupActions,
  GroupContent,
  GroupHeader,
  GroupTitleSection,
  SectionContent,
  SectionHeader,
  SectionTitle,
  TabSection,
} from '../../styles';
import type { TabProps, TrustedClaimIssuer } from '../../types';
import { AddTrustedClaimIssuerModal } from '../modals';

interface TrustedClaimIssuersSectionProps {
  asset: TabProps['asset'];
}

export const TrustedClaimIssuersSection: React.FC<
  TrustedClaimIssuersSectionProps
> = ({ asset }) => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [issuerToDelete, setIssuerToDelete] = useState<string | null>(null);
  const {
    addTrustedClaimIssuers,
    removeTrustedClaimIssuers,
    transactionInProcess,
  } = useAssetActionsContext();

  // Helper function to format claim types for display
  const formatClaimTypes = (trustedFor: TrustedFor[] | null): string => {
    if (trustedFor === null) {
      return 'All Claim Types';
    }
    if (trustedFor.length === 0) {
      return 'No Claim Types';
    }

    const formattedClaims = trustedFor.map((claimType) => {
      if (
        typeof claimType === 'object' &&
        claimType.type === 'Custom' &&
        'customClaimTypeId' in claimType
      ) {
        return `Custom ID ${claimType.customClaimTypeId.toString()}`;
      }
      // Convert camelCase to readable format for standard claim types
      return (claimType as string).replace(/([A-Z])/g, ' $1').trim();
    });

    return formattedClaims.join(', ');
  };

  const handleAddTrustedIssuer = () => {
    setAddModalOpen(true);
  };

  const handleDeleteClick = (issuerId: string) => {
    setIssuerToDelete(issuerId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (issuerToDelete) {
      await removeTrustedClaimIssuers([issuerToDelete]);
      setIssuerToDelete(null);
      setDeleteConfirmOpen(false);
    }
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
          <AddButton
            onClick={handleAddTrustedIssuer}
            disabled={transactionInProcess}
          >
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
                        onClick={() => handleDeleteClick(issuer.id)}
                        disabled={transactionInProcess}
                      >
                        <Icon name="Delete" size="14px" />
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

      <AddTrustedClaimIssuerModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddClaimIssuer={addTrustedClaimIssuers}
        transactionInProcess={transactionInProcess}
      />

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setIssuerToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Trusted Claim Issuer"
        message={`Are you sure you want to remove this trusted claim issuer (${issuerToDelete ? formatUuid(issuerToDelete) : ''})? This action cannot be undone.`}
        confirmLabel="Delete"
        isProcessing={transactionInProcess}
      />
    </>
  );
};
